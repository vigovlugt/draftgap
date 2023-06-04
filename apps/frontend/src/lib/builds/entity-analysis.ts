import { AnalyzeDraftConfig } from "../draft/analysis";
import { Role } from "../models/Role";
import {
    PartialBuildDataset,
    FullBuildDataset,
    BuildMatchupData,
} from "../models/build/BuildDataset";
import { ratingToWinrate, winrateToRating } from "../rating/ratings";
import { buildPriorGamesByRiskLevel } from "../risk/risk-level";
import { addStats, multiplyStats } from "../stats";

export type EntityAnalysisResult = {
    baseResult: BaseEntityAnalysisResult;
    matchupResult: EntityMatchupsAnalysisResult;
    totalRating: number;
};

export type BaseEntityAnalysisResult = {
    rating: number;
};

export type EntityMatchupAnalysisResult = {
    championKey: string;
    role: Role;
    rating: number;
};

export type EntityMatchupsAnalysisResult = {
    matchupResults: EntityMatchupAnalysisResult[];
    totalRating: number;
};

export type EntityStats = {
    wins: number;
    games: number;
};

export type EntityStatsGetter<T> = (
    dataset: PartialBuildDataset,
    entity: T
) => EntityStats;

export function analyzeEntity<T>(
    partialBuildDataset: PartialBuildDataset,
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig,
    getStats: EntityStatsGetter<T>,
    entity: T
) {
    const baseResult = analyzeBaseEntity(
        partialBuildDataset,
        fullBuildDataset,
        config,
        getStats,
        entity
    );
    const matchupResult = analyzeEntityMatchups(
        partialBuildDataset,
        fullBuildDataset,
        config,
        getStats,
        entity
    );

    const totalRating = baseResult.rating + matchupResult.totalRating;

    return {
        baseResult,
        matchupResult,
        totalRating,
    };
}

export function analyzeBaseEntity<T>(
    partialBuildDataset: PartialBuildDataset,
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig,
    getStats: EntityStatsGetter<T>,
    entity: T
) {
    const priorGames = buildPriorGamesByRiskLevel[config.riskLevel];

    const championWinrate =
        partialBuildDataset.wins / partialBuildDataset.games;

    const previousEntityStats = getStats(fullBuildDataset, entity);
    const previousEntityWinrate =
        previousEntityStats.wins / previousEntityStats.games;
    const currentEntityStats = getStats(partialBuildDataset, entity);

    const entityStats = addStats(currentEntityStats, {
        wins: priorGames * previousEntityWinrate,
        games: priorGames,
    });
    const entityWinrate = entityStats.wins / entityStats.games;
    const entityRating = winrateToRating(entityWinrate);

    const rating = entityRating - winrateToRating(championWinrate);

    return {
        rating,
    };
}

export function analyzeEntityMatchups<T>(
    partialBuildDataset: PartialBuildDataset,
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig,
    getStats: EntityStatsGetter<T>,
    entity: T
) {
    const matchupResults = fullBuildDataset.matchups.map((m) =>
        analyzeEntityMatchup(
            partialBuildDataset,
            fullBuildDataset,
            config,
            getStats,
            entity,
            m
        )
    );

    const totalRating = matchupResults.reduce(
        (total, r) => total + r.rating,
        0
    );

    return {
        matchupResults,
        totalRating,
    };
}

export function analyzeEntityMatchup<T>(
    _partialBuildDataset: PartialBuildDataset,
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig,
    getStats: EntityStatsGetter<T>,
    entity: T,
    matchup: BuildMatchupData
) {
    const priorGames = buildPriorGamesByRiskLevel[config.riskLevel];

    // Calculate entity rating
    const championWinrate = fullBuildDataset.wins / fullBuildDataset.games;
    const championWithEntityStats = getStats(fullBuildDataset, entity);
    const championWithEntityWinrate =
        championWithEntityStats.wins / championWithEntityStats.games;

    const entityRating =
        winrateToRating(championWithEntityWinrate) -
        winrateToRating(championWinrate);

    // Calculate entity rating in matchup
    const matchupWinrate = matchup.wins / matchup.games;
    const matchupRating = winrateToRating(matchupWinrate);
    const expectedWithEntityMatchupRating = matchupRating + entityRating;
    const expectedWithEntityMatchupWinrate = ratingToWinrate(
        expectedWithEntityMatchupRating
    );

    const rawMatchupWithEntityStats = getStats(matchup, entity);
    const percentageOfPriorGames =
        rawMatchupWithEntityStats.games < priorGames
            ? rawMatchupWithEntityStats.games / priorGames
            : 1;
    const matchupWithEntityStats = addStats(
        multiplyStats(rawMatchupWithEntityStats, percentageOfPriorGames),
        {
            wins: priorGames * expectedWithEntityMatchupWinrate,
            games: priorGames,
        }
    );
    const matchupWithEntityWinrate =
        matchupWithEntityStats.wins / matchupWithEntityStats.games;
    const matchupWithEntityRating = winrateToRating(matchupWithEntityWinrate);
    const entityRatingInMatchup = matchupWithEntityRating - matchupRating;

    // Calculate final rating
    const rating = entityRatingInMatchup - entityRating;

    return {
        championKey: matchup.championKey,
        role: matchup.role,
        rating: isNaN(rating) ? 0 : rating,
        raw: {
            games: rawMatchupWithEntityStats.games,
            wins: rawMatchupWithEntityStats.wins,
        },
        expected: expectedWithEntityMatchupWinrate,
    };
}
