#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

use reqwest::Client;
use serde::Serialize;
use serde_json::Value;
use tauri::async_runtime::Mutex;

struct AppState {
    lcu_data: Mutex<Option<LcuData>>,
    client: Client,
}

#[derive(Serialize, Debug)]
struct LcuData {
    port: u16,
    password: String,
    username: String,
}

fn get_league_lcu_data() -> Result<LcuData, String> {
    #[cfg(not(target_os = "windows"))]
    let output = std::process::Command::new("sh")
        .arg("-lc")
        .arg("ps axww -o args | grep -F 'LeagueClientUx ' | grep -v grep | head -n 1")
        .output()
        .map_err(|_| "Could not run command")?;

    #[cfg(target_os = "windows")]
    let output = {
        match std::process::Command::new("powershell")
            .arg("/C")
            .arg("Get-CimInstance -Query \"SELECT * from Win32_Process WHERE name LIKE 'LeagueClientUx.exe'\" | Select-Object -ExpandProperty CommandLine")
            .creation_flags(0x08000000) // CREATE_NO_WINDOW
            .output()
        {
            Ok(output) => Ok(output),
            Err(_) => {
                std::process::Command::new("C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell")
                    .arg("/C")
                    .arg("Get-CimInstance -Query \"SELECT * from Win32_Process WHERE name LIKE 'LeagueClientUx.exe'\" | Select-Object -ExpandProperty CommandLine")
                    .creation_flags(0x08000000) // CREATE_NO_WINDOW
                    .output()
            }
        }
    }
    .map_err(|e| "Could not run command:".to_owned() + &e.to_string())?;

    let output_str = String::from_utf8_lossy(&output.stdout);

    let port_regex = "--app-port=([0-9]+)";
    let password_regex = "--remoting-auth-token=([a-zA-Z0-9_-]+)";

    let port: u16 = regex::Regex::new(port_regex)
        .expect("Could not create port regex")
        .captures(&output_str)
        .ok_or_else(|| {
            "Could not find process, powershell output: \"".to_owned() + &output_str + "\""
        })?
        .get(1)
        .ok_or_else(|| "Could not find port")?
        .as_str()
        .parse()
        .map_err(|_| "Could not parse port")?;

    let password = regex::Regex::new(password_regex)
        .expect("Could not create password regex")
        .captures(&output_str)
        .ok_or_else(|| "Could not find password")?
        .get(1)
        .ok_or_else(|| "Could not find password")?
        .as_str()
        .to_owned();

    Ok(LcuData {
        port,
        password,
        username: "riot".to_owned(),
    })
}

async fn get_lcu_response(
    state: &tauri::State<'_, AppState>,
    path: &str,
) -> Result<serde_json::Value, String> {
    let mut lcu_data_mutex = state.lcu_data.lock().await;

    if lcu_data_mutex.is_none() {
        let new_lcu_data =
            get_league_lcu_data().map_err(|e| "Could not get lcu data: ".to_owned() + &e)?;
        *lcu_data_mutex = Some(new_lcu_data);
    }
    let lcu_data = lcu_data_mutex.as_ref().unwrap();

    let res = state
        .client
        .get(format!("https://127.0.0.1:{}/{}", lcu_data.port, path))
        .basic_auth(&lcu_data.username, Some(&lcu_data.password))
        .send()
        .await;

    let res = match res {
        Ok(res) => res,
        Err(e) => {
            *lcu_data_mutex = None;
            return Err("Could not get response: ".to_owned() + &e.to_string());
        }
    };

    let status = res.status();
    let body = res
        .text()
        .await
        .map_err(|e| format!("Could not read response body: {e}"))?;

    // 404: endpoint not found
    // 403: champ-select endpoints can be forbidden when not currently in champion select
    let is_champ_select_endpoint = path.starts_with("lol-champ-select/");

    if status == reqwest::StatusCode::NOT_FOUND
        || (is_champ_select_endpoint && status == reqwest::StatusCode::FORBIDDEN)
    {
        return Ok(serde_json::Value::Null);
    }

    if status == reqwest::StatusCode::UNAUTHORIZED {
        *lcu_data_mutex = None;
        return Err("Unauthorized".to_owned());
    }

    if !status.is_success() {
        return Err(format!("LCU returned {status}: {body}"));
    }

    let json = serde_json::from_str(&body).map_err(|e| {
        format!(
            "Could not parse json: {e}; body={}",
            body.chars().take(300).collect::<String>()
        )
    })?;

    Ok(json)
}

#[tauri::command]
async fn get_champ_select_session(
    state: tauri::State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    get_lcu_response(&state, "lol-champ-select/v1/session").await
}

#[tauri::command]
async fn get_current_summoner(state: tauri::State<'_, AppState>) -> Result<Value, String> {
    get_lcu_response(&state, "lol-summoner/v1/current-summoner").await
}

#[tauri::command]
async fn get_grid_champions(state: tauri::State<'_, AppState>) -> Result<Value, String> {
    get_lcu_response(&state, "lol-champ-select/v1/all-grid-champions").await
}

#[tauri::command]
async fn get_pickable_champion_ids(state: tauri::State<'_, AppState>) -> Result<Value, String> {
    get_lcu_response(&state, "lol-champ-select/v1/pickable-champion-ids").await
}

fn main() {
    let client = Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .expect("Could not build client");

    let state = AppState {
        lcu_data: Mutex::new(None),
        client,
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            get_champ_select_session,
            get_current_summoner,
            get_grid_champions,
            get_pickable_champion_ids
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
