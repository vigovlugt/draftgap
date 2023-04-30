import { AnalyzeDraftConfig } from "../draft/analysis";
import { Role } from "../models/Role";
import {
    PartialBuildDataset,
    FullBuildDataset,
    RunesBuildData,
    BuildMatchupData,
} from "../models/build/BuildDataset";
import { ratingToWinrate, winrateToRating } from "../rating/ratings";
import { priorGamesByRiskLevel } from "../risk/risk-level";
import { addStats } from "../stats";

const RUNE_TYPES = [
    "primary",
    "secondary",
    "shard-offense",
    "shard-defense",
    "shard-flex",
] as const;
type RuneType = (typeof RUNE_TYPES)[number];

export type RuneAnalysisResult = {
    runeResult: BaseRuneAnalysisResult;
    matchupResult: RuneMatchupsAnalysisResult;

    totalRating: number;
};

export type BaseRuneAnalysisResult = {
    rating: number;
};

export type RuneMatchupAnalysisResult = {
    championKey: string;
    role: Role;
    rating: number;
};

export type RuneMatchupsAnalysisResult = {
    matchupResults: RuneMatchupAnalysisResult[];
    totalRating: number;
};

export type RunesAnalysisResult = {
    primary: Record<string, RuneAnalysisResult>;
    secondary: Record<string, RuneAnalysisResult>;
    shard: {
        offense: Record<string, RuneAnalysisResult>;
        defense: Record<string, RuneAnalysisResult>;
        flex: Record<string, RuneAnalysisResult>;
    };
};

export function analyzeRunes(
    partialBuildDataset: PartialBuildDataset,
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig
): RunesAnalysisResult {
    const analyze = (runeType: RuneType) => {
        const runeIds = Object.keys(
            getRuneStatsMap(partialBuildDataset.runes, runeType)
        );
        return runeIds.reduce((result, runeId) => {
            const runeIdNumber = parseInt(runeId);
            const runeResult = analyzeRune(
                partialBuildDataset,
                fullBuildDataset,
                config,
                runeType,
                runeIdNumber
            );
            result[runeId] = runeResult;
            return result;
        }, {} as Record<string, RuneAnalysisResult>);
    };
    return {
        primary: analyze("primary"),
        secondary: analyze("secondary"),
        shard: {
            offense: analyze("shard-offense"),
            defense: analyze("shard-defense"),
            flex: analyze("shard-flex"),
        },
    };
}

function analyzeRune(
    partialBuildDataset: PartialBuildDataset,
    fullBuildDatset: FullBuildDataset,
    config: AnalyzeDraftConfig,
    runeType: RuneType,
    runeId: number
): RuneAnalysisResult {
    const baseRuneResult = analyzeBaseRune(
        partialBuildDataset,
        config,
        runeType,
        runeId
    );
    const matchupResult = analyzeRuneMatchups(
        fullBuildDatset,
        config,
        runeType,
        runeId
    );

    const totalRating = baseRuneResult.rating + matchupResult.totalRating;
    return {
        runeResult: baseRuneResult,
        matchupResult,
        totalRating,
    };
}

function analyzeBaseRune(
    partialBuildDataset: PartialBuildDataset,
    config: AnalyzeDraftConfig,
    runeType: RuneType,
    runeId: number
) {
    const championWinrate =
        partialBuildDataset.wins / partialBuildDataset.games;

    // TODO: add wilson score interval for low amount of games (instead of prior?)
    const runeStats = addStats(
        getRuneStats(partialBuildDataset.runes, runeType, runeId),
        {
            wins: priorGamesByRiskLevel[config.riskLevel] * championWinrate,
            games: priorGamesByRiskLevel[config.riskLevel],
        }
    );
    const runeWinrate = runeStats.wins / runeStats.games;

    const rating =
        winrateToRating(runeWinrate) - winrateToRating(championWinrate);

    return {
        rating,
    };
}

function analyzeRuneMatchups(
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig,
    runeType: RuneType,
    runeId: number
): RuneMatchupsAnalysisResult {
    const matchupResults = fullBuildDataset.matchups.map((matchup) =>
        analyzeRuneMatchup(fullBuildDataset, config, runeType, runeId, matchup)
    );
    const totalRating = matchupResults.reduce(
        (total, result) => total + result.rating,
        0
    );

    return {
        matchupResults,
        totalRating,
    };
}

function analyzeRuneMatchup(
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig,
    runeType: RuneType,
    runeId: number,
    matchup: BuildMatchupData
): RuneMatchupAnalysisResult {
    const baseChampionWinrate = fullBuildDataset.wins / fullBuildDataset.games;
    const championRuneStats = getRuneStats(
        fullBuildDataset.runes,
        runeType,
        runeId
    );
    const championRuneWinrate =
        championRuneStats.wins / championRuneStats.games;
    const runeRating =
        winrateToRating(championRuneWinrate) -
        winrateToRating(baseChampionWinrate);

    const baseMatchupWinrate = matchup.wins / matchup.games;
    const baseMatchupRating = winrateToRating(baseMatchupWinrate);
    const expectedRuneMatchupRating = baseMatchupRating + runeRating;
    const runeMatchupStats = addStats(
        getRuneStats(matchup.runes, runeType, runeId),
        {
            wins:
                priorGamesByRiskLevel[config.riskLevel] *
                ratingToWinrate(expectedRuneMatchupRating),
            games: priorGamesByRiskLevel[config.riskLevel],
        }
    );
    const matchupWithRuneWinrate =
        runeMatchupStats.wins / runeMatchupStats.games;
    const matchupWithRuneRating =
        winrateToRating(matchupWithRuneWinrate) - baseMatchupRating;

    const rating = matchupWithRuneRating - runeRating;

    return {
        championKey: matchup.championKey,
        role: matchup.role,
        rating: isNaN(rating) ? 0 : rating,
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
    runeBuildData: RunesBuildData,
    runeType: RuneType,
    runeId: number
) {
    switch (runeType) {
        case "primary":
            return runeBuildData.primary[runeId];
        case "secondary":
            return runeBuildData.secondary[runeId];
        case "shard-offense":
            return runeBuildData.shards.offense[runeId];
        case "shard-defense":
            return runeBuildData.shards.defense[runeId];
        case "shard-flex":
            return runeBuildData.shards.flex[runeId];
    }
}
