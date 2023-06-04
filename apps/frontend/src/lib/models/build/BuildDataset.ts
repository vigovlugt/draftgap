import { Role } from "../Role";

export type PartialBuildDataset = {
    championKey: string;
    role: Role;
    wins: number;
    games: number;

    runes: RunesBuildData;
    items: ItemsBuildData;
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
};

export type RunesBuildData = {
    primary: Record<string, RuneStats>;
    secondary: Record<string, RuneStats>;
    shards: {
        offense: Record<string, RuneStats>;
        defense: Record<string, RuneStats>;
        flex: Record<string, RuneStats>;
    };
};

export type RuneStats = {
    wins: number;
    games: number;
};

export type ItemsBuildData = {
    boots: Record<string, ItemStats>;
    statsByOrder: Record<string, ItemStats>[];
    startingSets: Record<string, SetStats>;
    sets: Record<string, SetStats>;
};

export type SetStats = {
    wins: number;
    games: number;
};

export type ItemStats = {
    wins: number;
    games: number;
};
