import { Role } from "../Role";

export type PartialBuildDataset = {
    championKey: string;
    role: Role;
    wins: number;
    games: number;

    runes: RunesBuildData;
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
