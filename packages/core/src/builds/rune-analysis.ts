import { AnalyzeDraftConfig } from "../draft/analysis";
import {
    PartialBuildDataset,
    FullBuildDataset,
    RunesBuildData,
} from "../models/build/BuildDataset";
import { EntityAnalysisResult, analyzeEntity } from "./entity-analysis";

const RUNE_TYPES = [
    "primary",
    "secondary",
    "shard-offense",
    "shard-defense",
    "shard-flex",
] as const;
type RuneType = (typeof RUNE_TYPES)[number];

export type RunesAnalysisResult = {
    primary: Record<string, EntityAnalysisResult>;
    secondary: Record<string, EntityAnalysisResult>;
    shards: {
        offense: Record<string, EntityAnalysisResult>;
        defense: Record<string, EntityAnalysisResult>;
        flex: Record<string, EntityAnalysisResult>;
    };
};

export function analyzeRunes(
    partialBuildDataset: PartialBuildDataset,
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig,
): RunesAnalysisResult {
    const analyze = (runeType: RuneType) => {
        const runeIds = Object.keys(
            getRuneStatsMap(partialBuildDataset.runes, runeType),
        );
        return runeIds.reduce(
            (result, runeId) => {
                const runeIdNumber = parseInt(runeId);
                const runeResult = analyzeEntity(
                    partialBuildDataset,
                    fullBuildDataset,
                    config,
                    getRuneStats,
                    {
                        type: runeType,
                        id: runeIdNumber,
                    },
                );
                result[runeId] = runeResult;
                return result;
            },
            {} as Record<string, EntityAnalysisResult>,
        );
    };
    return {
        primary: analyze("primary"),
        secondary: analyze("secondary"),
        shards: {
            offense: analyze("shard-offense"),
            defense: analyze("shard-defense"),
            flex: analyze("shard-flex"),
        },
    };
}

function getRuneStatsMap(runeBuildData: RunesBuildData, runeType: RuneType) {
    switch (runeType) {
        case "primary":
            return runeBuildData.primary;
        case "secondary":
            return runeBuildData.secondary;
        case "shard-offense":
            return runeBuildData.shards.offense;
        case "shard-defense":
            return runeBuildData.shards.defense;
        case "shard-flex":
            return runeBuildData.shards.flex;
    }
}

function getRuneStats(
    data: PartialBuildDataset,
    rune: {
        type: RuneType;
        id: number;
    },
) {
    switch (rune.type) {
        case "primary":
            return data.runes.primary[rune.id];
        case "secondary":
            return data.runes.secondary[rune.id];
        case "shard-offense":
            return data.runes.shards.offense[rune.id];
        case "shard-defense":
            return data.runes.shards.defense[rune.id];
        case "shard-flex":
            return data.runes.shards.flex[rune.id];
    }
}
