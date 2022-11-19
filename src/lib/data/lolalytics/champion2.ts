import { fetch } from "undici";
import { Role } from "../../models/Role";

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
    lane: Role | "default" = "default"
) {
    // convert patch from 12.21.1 to 12.21
    patch = patch.split(".").slice(0, 2).join(".");

    const res = await fetch(
        `https://axe.lolalytics.com/mega/?ep=champion2&p=d&v=1&patch=${patch}&cid=${championKey}&lane=${lane}&tier=platinum_plus&queue=420&region=all`
    );

    const json = (await res.json()) as LolalyticsChampion2Response;

    return json;
}
