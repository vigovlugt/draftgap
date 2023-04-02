import { invoke } from "@tauri-apps/api";
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

export async function getOwnedChampionsMinimal(): Promise<
    | {
          id: number;
      }[]
    | null
> {
    return (await invoke("get_owned_champions_minimal")) as any;
}
