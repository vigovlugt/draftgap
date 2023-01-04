import { invoke } from "@tauri-apps/api";
import {
    LolChampSelectChampSelectSession,
    LolSummonerSummoner,
} from "../types/Lcu";

export async function getChampSelectSession(): Promise<LolChampSelectChampSelectSession | null> {
    return (await invoke(
        "get_champ_select_session"
    )) as LolChampSelectChampSelectSession | null;
}

export async function getCurrentSummoner(): Promise<LolSummonerSummoner | null> {
    return (await invoke("get_current_summoner")) as LolSummonerSummoner | null;
}
