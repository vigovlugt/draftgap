import { retry } from "../utils";
import { type LolalyticsRole } from "./roles";

export type LolalyticsChampion2Response = {
    team_h: string[];
    team: Team;
    response: Response;
};

export type Response = {
    valid: boolean;
    duration: string;
};

export type Team = {
    top: Array<number[]>;
    middle: Array<number[]>;
    bottom: Array<number[]>;
    support: Array<number[]>;
    jungle: Array<number[]>;
};

export async function getLolalyticsQwikChampion2(
    patch: string,
    championId: string,
    role?: LolalyticsRole
    // matchupId?: string,
    // matchupRole?: LolalyticsRole
) {
    championId = championId.toLowerCase();
    if (championId === "monkeyking") {
        championId = "wukong";
    }
    // convert patch from 12.21.1 to 12.21
    patch = patch.split(".").slice(0, 2).join(".");

    // https://a1.lolalytics.com/mega/?ep=build-team&v=1&patch=14.19&c=wukong&lane=bottom&tier=emerald_plus&queue=ranked&region=all
    const queryParams = new URLSearchParams();
    queryParams.append("ep", "build-team");
    queryParams.append("v", "1");
    queryParams.append("tier", "emerald_plus");
    queryParams.append("queue", "ranked");
    queryParams.append("region", "all");
    queryParams.append("patch", patch);
    queryParams.append("c", championId);
    queryParams.append("lane", role ?? "all"); // all is default?
    // if (matchupId && matchupRole) {
    //     queryParams.append("matchup", matchupId);
    //     queryParams.append("vslane", matchupRole);
    // }

    const res = await retry(() =>
        fetch(`https://a1.lolalytics.com/mega/?${queryParams.toString()}`)
    );

    const json = (await res.json()) as LolalyticsChampion2Response;

    return json;
}
