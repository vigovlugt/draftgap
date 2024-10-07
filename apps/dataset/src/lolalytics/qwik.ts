import { retry } from "../utils";
import { LolalyticsRole } from "./roles";

export type QwikLolalyticsData = {
    header: Header;
    summary: Summary;
    graph: Graph;
    nav: Nav;
    analysed: number;
    avgWr: number;
    n: number;
    runes: WelcomeRunes;
    sidebar: Sidebar;
    skillEarly: Array<Array<number[]>>;
    builtBootSet3: Array<Array<number | string>>;
    spells: Array<Array<number | string>>;
    startItem: Array<number[]>;
    skill6: Array<number[]>;
    skill10: Array<number[]>;
    skill15: Array<number[]>;
    itemSets: ItemSets;
    boots: Array<number[]>;
    supportItem: Array<number[]>;
    popularItem: Array<number[]>;
    winningItem: Array<number[]>;
    item: Array<number[]>;
    item1: Array<number[]>;
    item2: Array<number[]>;
    item3: Array<number[]>;
    item4: Array<number[]>;
    item5: Array<number[]>;
    skillOrder: Array<Array<number | string>>;
    earlyItem: Array<number[]>;
    startSet: Array<Array<number | string>>;
    enemy_h: string[];
    enemy: Enemy;
    response: Response;
};

export type Enemy = {
    top: Array<number[]>;
    jungle: Array<number[]>;
    middle: Array<number[]>;
    bottom: Array<number[]>;
    support: Array<number[]>;
};

export type Graph = {
    dates: Date[];
    wr: Br;
    wrs: Br;
    pr: Br;
    n: Br;
    br: Br;
};

export type Br = {
    all: number[];
    diamond_plus: number[];
    emerald: number[];
    platinum: number[];
    gold: number[];
    silver: number[];
    bronze: number[];
    iron: number[];
};

export type Header = {
    patch: string;
    defaultLane: string;
    cid: number;
    lane: string;
    queue: number;
    counters: Counters;
    wr: number;
    avgWr: number;
    avgWrDelta: number;
    pr: number;
    n: number;
    br: number;
    rank: number;
    rankTotal: number;
    tier: string;
    topWin: number;
    topElo: string;
    damage: Damage;
};

export type Counters = {
    strong: number[];
    weak: number[];
};

export type Damage = {
    physical: number;
    magic: number;
    true: number;
};

export type ItemSets = {
    itemBootSet1: { [key: string]: number[] };
    itemBootSet2: { [key: string]: number[] };
    itemBootSet3: { [key: string]: number[] };
};

export type Nav = {
    lanes: Lanes;
};

export type Lanes = {
    top: number;
    jungle: number;
    middle: number;
    bottom: number;
    support: number;
};

export type Response = {
    valid: boolean;
    duration: string;
};

export type WelcomeRunes = {
    stats: { [key: string]: Array<number[]> };
};

export type Sidebar = {
    topList: Array<Array<TopListClass | number | string>>;
    depth: Array<number | string>;
    topStats: TopStats;
    stats: Stats;
    time: Time;
    objective: { [key: string]: number[] };
};

export type Stats = {
    stats: Array<Array<number | string>>;
    count: number;
};

export type Time = {
    time: { [key: string]: number };
    timeWin: { [key: string]: number };
};

export type TopListClass = {
    support: string;
};

export type TopStats = {
    toppick: number;
    toprank: number;
    topcount: number;
    topwin: number;
    topelo: string;
};

export type Summary = {
    pick: Pick;
    win: Pick;
};

export type Pick = {
    skillpriority: Skillpriority;
    skillorder: Skillorder;
    sums: Sums;
    runes: PickRunes;
    items: Items;
};

export type Items = {
    start: Start;
    core: Core;
    item4: Skillorder[];
    item5: Skillorder[];
    item6: Skillorder[];
};

export type Core = {
    set: number[];
    wr: number;
    n: number;
};

export type Skillorder = {
    id: number;
    n: number;
    wr: number;
};

export type Start = {
    n: number;
    wr: number;
    set: number[];
    setUnique: number[];
    count: number[];
};

export type PickRunes = {
    wr: number;
    n: number;
    page: Page;
    set: Set;
};

export type Page = {
    pri: number;
    sec: number;
};

export type Set = {
    pri: number[];
    sec: number[];
    mod: number[];
};

export type Skillpriority = {
    id: string;
    n: number;
    wr: number;
};

export type Sums = {
    ids: number[];
    n: number;
    wr: number;
};

function getDataId(objs: any) {
    return objs
        .findIndex(
            (obj: any) =>
                obj["analysed"] !== undefined &&
                obj["avgWr"] !== undefined &&
                obj["enemy"] !== undefined
        )
        .toString(36);
}

function parseObj(objs: any[], id: string): any {
    function get(id: string) {
        const idx = parseInt(id, 36);
        return objs[idx];
    }

    const obj = get(id);

    if (Array.isArray(obj)) {
        return obj.map((value) => parseObj(objs, value));
    }

    if (typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [
                key,
                parseObj(objs, value as string),
            ])
        );
    }

    return obj;
}

function extractData(text: string): QwikLolalyticsData {
    const regex =
        /<script\s+type=["']qwik\/json["'][^>]*>([\s\S]*?)<\/script>/i;
    const match = text.match(regex);
    if (!match) {
        throw new Error("No match found");
    }

    const innerText = match[1]; // The inner content
    const json = JSON.parse(innerText);
    const parsedData = parseObj(json.objs, getDataId(json.objs));

    return parsedData;
}

export async function getLolalyticsQwikChampion(
    patch: string,
    championId: string,
    role?: LolalyticsRole,
    matchupId?: string,
    matchupRole?: LolalyticsRole
) {
    championId = championId.toLowerCase();
    if (championId === "monkeyking") {
        championId = "wukong";
    }
    if (matchupId) {
        matchupId = matchupId.toLowerCase();
    }
    if (matchupId === "monkeyking") {
        matchupId = "wukong";
    }

    // convert patch from ex. 12.21.1 to 12.21
    patch = patch.split(".").slice(0, 2).join(".");

    const queryParams = new URLSearchParams();
    queryParams.append("tier", "emerald_plus");
    queryParams.append("region", "all");
    queryParams.append("patch", patch);
    if (role) {
        queryParams.append("lane", role);
    }
    let vsUrl = "";
    if (matchupId && matchupRole) {
        vsUrl = `vs/${matchupId}/`;
        queryParams.append("vslane", matchupRole);
    }

    const url = `https://lolalytics.com/lol/${championId}/${vsUrl}build/?${queryParams.toString()}`;
    const res = await retry(() => fetch(url));
    if (!res.ok) {
        throw new Error(
            "Failed to fetch lolalytics champion " + url + " " + res.status
        );
    }

    const text = await res.text();
    if (!text) {
        throw new Error("No text for lolalytics champion " + championId);
    }

    const data = extractData(text);

    return data;
}
