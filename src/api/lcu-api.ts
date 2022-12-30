import { invoke } from "@tauri-apps/api";
import { LolChampSelectChampSelectSession } from "../types/Lcu";

export async function getChampSelectSession(): Promise<LolChampSelectChampSelectSession | null> {
    return (await invoke(
        "get_champ_select_session"
    )) as LolChampSelectChampSelectSession | null;
}
