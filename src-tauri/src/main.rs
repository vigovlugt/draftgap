#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{env, os::windows::process::CommandExt};

use reqwest::{Certificate, Client};
use serde::Serialize;
use tauri::async_runtime::Mutex;

const RIOT_GAMES_CERTIFICATE: &str = "-----BEGIN CERTIFICATE-----
MIIEIDCCAwgCCQDJC+QAdVx4UDANBgkqhkiG9w0BAQUFADCB0TELMAkGA1UEBhMC
VVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFTATBgNVBAcTDFNhbnRhIE1vbmljYTET
MBEGA1UEChMKUmlvdCBHYW1lczEdMBsGA1UECxMUTG9MIEdhbWUgRW5naW5lZXJp
bmcxMzAxBgNVBAMTKkxvTCBHYW1lIEVuZ2luZWVyaW5nIENlcnRpZmljYXRlIEF1
dGhvcml0eTEtMCsGCSqGSIb3DQEJARYeZ2FtZXRlY2hub2xvZ2llc0ByaW90Z2Ft
ZXMuY29tMB4XDTEzMTIwNDAwNDgzOVoXDTQzMTEyNzAwNDgzOVowgdExCzAJBgNV
BAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRUwEwYDVQQHEwxTYW50YSBNb25p
Y2ExEzARBgNVBAoTClJpb3QgR2FtZXMxHTAbBgNVBAsTFExvTCBHYW1lIEVuZ2lu
ZWVyaW5nMTMwMQYDVQQDEypMb0wgR2FtZSBFbmdpbmVlcmluZyBDZXJ0aWZpY2F0
ZSBBdXRob3JpdHkxLTArBgkqhkiG9w0BCQEWHmdhbWV0ZWNobm9sb2dpZXNAcmlv
dGdhbWVzLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKoJemF/
6PNG3GRJGbjzImTdOo1OJRDI7noRwJgDqkaJFkwv0X8aPUGbZSUzUO23cQcCgpYj
21ygzKu5dtCN2EcQVVpNtyPuM2V4eEGr1woodzALtufL3Nlyh6g5jKKuDIfeUBHv
JNyQf2h3Uha16lnrXmz9o9wsX/jf+jUAljBJqsMeACOpXfuZy+YKUCxSPOZaYTLC
y+0GQfiT431pJHBQlrXAUwzOmaJPQ7M6mLfsnpHibSkxUfMfHROaYCZ/sbWKl3lr
ZA9DbwaKKfS1Iw0ucAeDudyuqb4JntGU/W0aboKA0c3YB02mxAM4oDnqseuKV/CX
8SQAiaXnYotuNXMCAwEAATANBgkqhkiG9w0BAQUFAAOCAQEAf3KPmddqEqqC8iLs
lcd0euC4F5+USp9YsrZ3WuOzHqVxTtX3hR1scdlDXNvrsebQZUqwGdZGMS16ln3k
WObw7BbhU89tDNCN7Lt/IjT4MGRYRE+TmRc5EeIXxHkQ78bQqbmAI3GsW+7kJsoO
q3DdeE+M+BUJrhWorsAQCgUyZO166SAtKXKLIcxa+ddC49NvMQPJyzm3V+2b1roP
SvD2WV8gRYUnGmy/N0+u6ANq5EsbhZ548zZc+BI4upsWChTLyxt2RxR7+uGlS1+5
EcGfKZ+g024k/J32XP4hdho7WYAS2xMiV83CfLR/MNi8oSMaVQTdKD8cpgiWJk3L
XWehWA==
-----END CERTIFICATE-----
";

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

#[tauri::command]
fn get_league_lcu_data() -> Result<LcuData, String> {
    let os = env::consts::OS;
    let is_mac = os == "macos";
    let command = if is_mac {
        "ps x -o args | grep 'LeagueClientUx'"
    } else {
        "WMIC PROCESS WHERE name='LeagueClientUx.exe' GET commandline"
    };

    let output = if is_mac {
        std::process::Command::new("sh")
            .arg("-c")
            .arg(command)
            .output()
            .map_err(|_| "Could not run command")?
    } else {
        std::process::Command::new("cmd")
            .arg("/C")
            .arg(command)
            .creation_flags(0x08000000) // CREATE_NO_WINDOW
            .output()
            .map_err(|_| "Could not run command")?
    };
    let output_str = std::str::from_utf8(&output.stdout).map_err(|_| "Could not parse output")?;

    let port_regex = "--app-port=([0-9]+)";
    let password_regex = "--remoting-auth-token=([a-zA-Z0-9_-]+)";

    let port: u16 = regex::Regex::new(port_regex)
        .expect("Could not create port regex")
        .captures(output_str)
        .ok_or_else(|| "Could not find port")?
        .get(1)
        .ok_or_else(|| "Could not find port")?
        .as_str()
        .parse()
        .map_err(|_| "Could not parse port")?;

    let password = regex::Regex::new(password_regex)
        .expect("Could not create password regex")
        .captures(output_str)
        .ok_or_else(|| "Could not find password")?
        .get(1)
        .ok_or_else(|| "Could not find password")?
        .as_str()
        .to_owned();

    let lcu_data = LcuData {
        port,
        password,
        username: "riot".to_owned(),
    };

    return Ok(lcu_data);
}

#[tauri::command]
async fn get_champ_select_session(
    state: tauri::State<'_, AppState>,
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
        .get(format!(
            "https://127.0.0.1:{}/lol-champ-select/v1/session",
            lcu_data.port
        ))
        .basic_auth(lcu_data.username.clone(), Some(lcu_data.password.clone()))
        .send()
        .await;

    let res = match res {
        Ok(res) => res,
        Err(e) => {
            *lcu_data_mutex = None;
            return Err("Could not get response".to_owned() + &e.to_string());
        }
    };

    if res.status() == 404 {
        return Ok(serde_json::Value::Null);
    }

    if res.status() == 401 {
        *lcu_data_mutex = None;
        return Err("Unauthorized".to_owned());
    }

    let json = res.json().await.map_err(|_| "Could not parse json")?;

    return Ok(json);
}

fn main() {
    let client = Client::builder()
        .add_root_certificate(Certificate::from_pem(RIOT_GAMES_CERTIFICATE.as_bytes()).unwrap())
        .build()
        .expect("Could not build client");

    let state = AppState {
        lcu_data: Mutex::new(None),
        client,
    };

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![get_champ_select_session])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
