import { AnalyzeDraftConfig } from "../draft/analysis";
import { Role } from "../models/Role";
import {
    PartialBuildDataset,
    FullBuildDataset,
    BuildMatchupData,
    ItemsBuildData,
} from "../models/build/BuildDataset";
import { ratingToWinrate, winrateToRating } from "../rating/ratings";
import { priorGamesByRiskLevel } from "../risk/risk-level";
import { addStats } from "../stats";

export type ItemAnalysisResult = {
    itemResult: BaseItemAnalysisResult;
    matchupResult: ItemMatchupsAnalysisResult;
    totalRating: number;
};

export type BaseItemAnalysisResult = {
    rating: number;
};

export type ItemMatchupAnalysisResult = {
    championKey: string;
    role: Role;
    rating: number;
};

export type ItemMatchupsAnalysisResult = {
    matchupResults: ItemMatchupAnalysisResult[];
    totalRating: number;
};

export type ItemsAnalysisResult = {
    boots: Record<string, ItemAnalysisResult>;
    statsByOrder: Record<string, ItemAnalysisResult>[];
};

export function analyzeItems(
    partialBuildDataset: PartialBuildDataset,
    fullBuildDatset: FullBuildDataset,
    config: AnalyzeDraftConfig
): ItemsAnalysisResult {
    return {
        boots: Object.keys(partialBuildDataset.items.boots).reduce(
            (acc, itemId) => {
                acc[itemId] = analyzeItem(
                    partialBuildDataset,
                    fullBuildDatset,
                    config,
                    "boots",
                    parseInt(itemId)
                );
                return acc;
            },
            {} as Record<string, ItemAnalysisResult>
        ),
        statsByOrder: partialBuildDataset.items.statsByOrder.map((stats, i) => {
            return Object.keys(stats).reduce((acc, itemId) => {
                acc[itemId] = analyzeItem(
                    partialBuildDataset,
                    fullBuildDatset,
                    config,
                    i,
                    parseInt(itemId)
                );
                return acc;
            }, {} as Record<string, ItemAnalysisResult>);
        }),
    };
}

export function analyzeItem(
    partialBuildDataset: PartialBuildDataset,
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig,
    type: number | "boots",
    itemId: number
): ItemAnalysisResult {
    const itemResult = analyzeBaseItem(
        partialBuildDataset,
        config,
        type,
        itemId
    );

    const matchupResult = analyzeItemMatchups(
        fullBuildDataset,
        config,
        type,
        itemId
    );

    const totalRating = itemResult.rating + matchupResult.totalRating;

    return {
        itemResult,
        matchupResult,
        totalRating,
    };
}

function analyzeBaseItem(
    partialBuildDataset: PartialBuildDataset,
    config: AnalyzeDraftConfig,
    type: number | "boots",
    itemId: number
) {
    const championWinrate =
        partialBuildDataset.wins / partialBuildDataset.games;

    // TODO: add wilson score interval for low amount of games (instead of prior?)
    const championWithItemStats = addStats(
        getItemStats(partialBuildDataset.items, type, itemId),
        {
            wins: priorGamesByRiskLevel[config.riskLevel] * championWinrate,
            games: priorGamesByRiskLevel[config.riskLevel],
        }
    );
    const championWithItemWinrate =
        championWithItemStats.wins / championWithItemStats.games;

    const rating =
        winrateToRating(championWithItemWinrate) -
        winrateToRating(championWinrate);

    return {
        rating,
    };
}

function analyzeItemMatchups(
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig,
    type: number | "boots",
    itemId: number
) {
    const matchupResults = fullBuildDataset.matchups.map((matchup) =>
        analyzeItemMatchup(fullBuildDataset, config, type, itemId, matchup)
    );
    const totalRating = matchupResults.reduce(
        (total, matchup) => total + matchup.rating,
        0
    );

    return {
        matchupResults,
        totalRating,
    };
}

function analyzeItemMatchup(
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig,
    type: number | "boots",
    itemId: number,
    matchup: BuildMatchupData
): ItemMatchupAnalysisResult {
    const baseChampionWinrate = fullBuildDataset.wins / fullBuildDataset.games;
    const championWithItemStats = getItemStats(
        fullBuildDataset.items,
        type,
        itemId
    );
    const championWithItemWinrate =
        championWithItemStats.wins / championWithItemStats.games;
    const itemRating =
        winrateToRating(championWithItemWinrate) -
        winrateToRating(baseChampionWinrate);

    const baseMatchupWinrate = matchup.wins / matchup.games;
    const baseMatchupRating = winrateToRating(baseMatchupWinrate);
    const expectedItemMatchupRating = baseMatchupRating + itemRating;

    const itemMatchupStats = addStats(
        getItemStats(matchup.items, type, itemId),
        {
            wins:
                priorGamesByRiskLevel[config.riskLevel] *
                ratingToWinrate(expectedItemMatchupRating),
            games: priorGamesByRiskLevel[config.riskLevel],
        }
    );
    const matchupWithItemWinrate =
        itemMatchupStats.wins / itemMatchupStats.games;
    const matchupWithItemRating =
        winrateToRating(matchupWithItemWinrate) - baseMatchupRating;

    const rating = matchupWithItemRating - itemRating;

    if (
        fullBuildDataset.championKey === "96" &&
        matchup.championKey == "147" &&
        itemId == 3006
    )
        debugger;

    return {
        championKey: matchup.championKey,
        role: matchup.role,
        rating: isNaN(rating) ? 0 : rating,
    };
}

function getItemStats(
    itemData: ItemsBuildData,
    // order or boots
    type: number | "boots",
    itemId: number
) {
    if (type === "boots") {
        return (
            itemData.boots[itemId] ?? {
                wins: 0,
                games: 0,
            }
        );
    }

    return (
        itemData.statsByOrder[type][itemId] ?? {
            wins: 0,
            games: 0,
        }
    );
}
