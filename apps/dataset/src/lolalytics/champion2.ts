import { retry } from "../utils";
import type { LolalyticsRole } from "./roles";

export interface LolalyticsChampion2Response {
    skills: Skills;
    itemSets: ItemSets;
    startSet: Array<Array<number | string>>;
    earlySet: Array<Array<number | string>>;
    team_top: [number, number, number, number][] | undefined;
    team_jungle: [number, number, number, number][] | undefined;
    team_middle: [number, number, number, number][] | undefined;
    team_bottom: [number, number, number, number][] | undefined;
    team_support: [number, number, number, number][] | undefined;
    key: string;
    cache: string;
    response: Response;
}

interface ItemSets {
    itemSet1: { [key: string]: number[] };
    itemSet2: { [key: string]: number[] };
    itemSet3: { [key: string]: number[] };
    itemSet4: { [key: string]: number[] };
    itemSet5: { [key: string]: number[] };
    itemBootSet1: { [key: string]: number[] };
    itemBootSet2: { [key: string]: number[] };
    itemBootSet3: { [key: string]: number[] };
    itemBootSet4: { [key: string]: number[] };
    itemBootSet5: { [key: string]: number[] };
    itemBootSet6: { [key: string]: number[] };
}

interface Response {
    platform: string;
    version: number;
    endPoint: string;
    valid: boolean;
    duration: string;
}

interface Skills {
    skillEarly: Array<Array<number[]>>;
    skillOrder: Array<Array<number | string>>;
    skill6: Array<number[]>;
    skill6Pick: number;
    skill10: Array<number[]>;
    skill10Pick: number;
    skill15: Array<number[]>;
    skill15Pick: number;
}

export async function getLolalyticsChampion2(
    patch: string,
    championKey: string,
    role: LolalyticsRole | "default" = "default",
    matchup?: string,
    matchupRole?: LolalyticsRole,
) {
    // convert patch from 12.21.1 to 12.21
    patch = patch.split(".").slice(0, 2).join(".");

    const queryParams = new URLSearchParams();
    queryParams.append("ep", "champion2");
    queryParams.append("p", "d");
    queryParams.append("v", "1");
    queryParams.append("tier", "emerald_plus");
    queryParams.append("queue", "420");
    queryParams.append("region", "all");
    queryParams.append("patch", patch);
    queryParams.append("cid", championKey);
    queryParams.append("lane", role);
    if (matchup && matchupRole) {
        queryParams.append("matchup", matchup);
        queryParams.append("vslane", matchupRole);
    }

    const res = await retry(() =>
        fetch(`https://ax.lolalytics.com/mega/?${queryParams.toString()}`),
    );

    const json = (await res.json()) as LolalyticsChampion2Response;

    return json;
}
