import { invoke } from "@tauri-apps/api/core";
import {
    LolChampSelectChampSelectSession,
    LolChampSelectGridChampions,
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

export async function getGridChampions(): Promise<LolChampSelectGridChampions | null> {
    return (await invoke(
        "get_grid_champions"
    )) as LolChampSelectGridChampions | null;
}

export async function getPickableChampionIds(): Promise<number[] | null> {
    return (await invoke("get_pickable_champion_ids")) as number[] | null;
}
