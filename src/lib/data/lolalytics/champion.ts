import { retry } from "../../../utils/fetch";
import { LolalyticsRole } from "./roles";

export interface LolalyticsChampionResponse {
    header: Header;
    summary: Summary;
    graph: Graph;
    nav: Nav;
    analysed: number;
    avgWinRate: number;
    top: Array<Array<TopClass | number | string>>;
    depth: Array<number | string>;
    n: number;
    skills: Skills;
    time: { [key: string]: number };
    timeWin: { [key: string]: number };
    topStats: TopStats;
    stats: Array<Array<number | string>>;
    statsCount: number;
    runes: LolalyticsChampionResponseRunes;
    objective: { [key: string]: Objective };
    spell: Array<number[]>;
    spells: Array<Array<number | string>>;
    itemSets: ItemSets;
    startItem: Array<number[]>;
    startSet: Array<Array<number | string>>;
    earlyItem: Array<number[]>;
    boots: Array<number[]>;
    mythicItem: Array<number[]>;
    popularItem: Array<number[]>;
    winningItem: Array<number[]>;
    item: Array<number[]>;
    item1: Array<number[]>;
    item2: Array<number[]>;
    item3: Array<number[]>;
    item4: Array<number[]>;
    item5: Array<number[]>;
    enemy_top: Array<number[]>;
    enemy_jungle: Array<number[]>;
    enemy_middle: Array<number[]>;
    enemy_bottom: Array<number[]>;
    enemy_support: Array<number[]>;
    key: string;
    cache: string;
    response: Response;
}

export interface Graph {
    dates: Date[];
    wr: Br;
    wrs: Br;
    pr: Br;
    n: Br;
    br: Br;
}

export interface Br {
    all: number[];
    diamond_plus: number[];
    platinum: number[];
    gold: number[];
    silver: number[];
    bronze: number[];
    iron: number[];
}

export interface Header {
    n: number;
    defaultLane: string;
    lane: string;
    counters: Counters;
    wr: number;
    pr: number;
    br: number;
    rank: number;
    rankTotal: number;
    tier: string;
    topWin: number;
    topElo: string;
    damage: Damage;
}

export interface Counters {
    strong: number[];
    weak: number[];
}

export interface Damage {
    physical: number;
    magic: number;
    true: number;
}

export interface ItemSets {
    itemBootSet1: { [key: string]: number[] };
    itemBootSet2: { [key: string]: number[] };
    itemBootSet3: { [key: string]: number[] };
}

export interface Nav {
    lanes: LaneData;
}

export interface LaneData {
    top: number;
    jungle: number;
    middle: number;
    bottom: number;
    support: number;
}

export interface Objective {
    lose: number[];
    win: number[];
}

export interface Response {
    platform: string;
    version: number;
    endPoint: string;
    valid: boolean;
    duration: string;
}

export interface LolalyticsChampionResponseRunes {
    stats: { [key: string]: [number, number, number][] };
}

export interface Skills {
    skillEarly: Array<Array<number[]>>;
    skill6Pick: number;
    skill10Pick: number;
    skillOrder: Array<Array<number | string>>;
}

export interface Summary {
    skillpriority: Skillpriority;
    skillorder: Skillorder;
    sum: Skillpriority;
    sums: number[];
    runes: SummaryRunes;
    items: Items;
}

export interface Items {
    win: ItemsPick;
    pick: ItemsPick;
}

export interface ItemsPick {
    start: Core;
    core: Core;
    item4: PickElement[];
    item5: PickElement[];
    item6: PickElement[];
}

export interface Core {
    n: number;
    wr: number;
    set: number[];
}

export interface PickElement {
    id: number;
    n: number;
    wr: number;
}

export interface SummaryRunes {
    pick: RunesPick;
    win: RunesPick;
}

export interface RunesPick {
    wr: number;
    n: number;
    page: Page;
    set: Set;
}

export interface Page {
    pri: number;
    sec: number;
}

export interface Set {
    pri: number[];
    sec: number[];
    mod: number[];
}

export interface Skillorder {
    win: PickElement;
    pick: PickElement;
}

export interface Skillpriority {
    win: SkillpriorityPick;
    pick: SkillpriorityPick;
}

export interface SkillpriorityPick {
    id: string;
    n: number;
    wr: number;
}

export interface TopClass {
    support: string;
    bottom?: string;
    top?: string;
    middle?: string;
}

export interface TopStats {
    toppick: number;
    toprank: number;
    topcount: number;
    topwin: number;
    topelo: string;
}

export async function getLolalyticsChampion(
    patch: string,
    championKey: string,
    role: LolalyticsRole | "default" = "default",
    matchup?: string,
    matchupRole?: LolalyticsRole
) {
    // convert patch from 12.21.1 to 12.21
    patch = patch.split(".").slice(0, 2).join(".");

    const queryParams = new URLSearchParams();
    queryParams.append("ep", "champion");
    queryParams.append("p", "d");
    queryParams.append("v", "1");
    queryParams.append("tier", "platinum_plus");
    queryParams.append("queue", "420");
    queryParams.append("region", "all");
    queryParams.append("patch", patch);
    queryParams.append("cid", championKey);
    queryParams.append("lane", role);
    if (matchup && matchupRole) {
        queryParams.append("matchup", matchup);
        queryParams.append("vslane", matchupRole);
    }

    const url = `https://axe.lolalytics.com/mega/?${queryParams.toString()}`;
    const res = await retry(() => fetch(url));

    const text = await res.text();
    if (!text) {
        throw new Error("No text for lolalytics champion " + championKey);
    }

    try {
        const json = JSON.parse(text) as LolalyticsChampionResponse;

        return json;
    } catch (e) {
        throw new Error(
            "Error parsing JSON for lolalytics champion " +
                championKey +
                " url: " +
                url,
            {
                cause: e,
            }
        );
    }
}
