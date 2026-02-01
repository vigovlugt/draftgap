import { Role } from "../Role";

export type PartialBuildDataset = {
    championKey: string;
    role: Role;
    wins: number;
    games: number;

    runes: RunesBuildData;
    items: ItemsBuildData;
    summonerSpells: SummonerSpellsBuildData;
    skills: SkillsBuildData;
};

export type EntityStats = {
    wins: number;
    games: number;
};

export type FullBuildDataset = PartialBuildDataset & {
    matchups: BuildMatchupData[];
};

export type BuildMatchupData = {
    championKey: string;
    role: Role;
    wins: number;
    games: number;

    runes: RunesBuildData;
    items: ItemsBuildData;
    summonerSpells: SummonerSpellsBuildData;
    skills: SkillsBuildData;
};

export type RunesBuildData = {
    primary: Record<string, EntityStats>;
    secondary: Record<string, EntityStats>;
    shards: {
        offense: Record<string, EntityStats>;
        defense: Record<string, EntityStats>;
        flex: Record<string, EntityStats>;
    };
};

export type ItemsBuildData = {
    boots: Record<string, EntityStats>;
    statsByOrder: Record<string, EntityStats>[];
    startingSets: Record<string, EntityStats>;
    sets: Record<string, EntityStats>;
};

export type SummonerSpellsBuildData = Record<string, SummonerSpellStats>;

export type SummonerSpellStats = {
    wins: number;
    games: number;
};

export type Skill = "Q" | "W" | "E" | "R";
export type SkillOrder = "QWE" | "QEW" | "WQE" | "WEQ" | "EQW" | "EWQ";

export type SkillsBuildData = {
    order: Record<SkillOrder, EntityStats>;
    level: Record<Skill, EntityStats>[];
};
