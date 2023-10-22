import { Dataset } from "../models/dataset/Dataset";
import { Role } from "../models/Role";
import { winrateToRating, ratingToWinrate } from "../rating/ratings";
import { RiskLevel, priorGamesByRiskLevel } from "../risk/risk-level";
import { addStats, averageStats } from "../stats";
import { getStats } from "./utils";

export type DraftResult = {
    allyChampionRating: AnalyzeChampionsResult;
    enemyChampionRating: AnalyzeChampionsResult;
    allyDuoRating: AnalyzeDuosResult;
    enemyDuoRating: AnalyzeDuosResult;
    matchupRating: AnalyzeMatchupsResult;

    totalRating: number;
    winrate: number;
};

export interface AnalyzeDraftConfig {
    ignoreChampionWinrates: boolean;
    riskLevel: RiskLevel;
    minGames: number;
}

export function analyzeDraft(
    dataset: Dataset,
    fullDataset: Dataset,
    team: Map<Role, string>,
    enemy: Map<Role, string>,
    config: AnalyzeDraftConfig
): DraftResult {
    const priorGames = priorGamesByRiskLevel[config.riskLevel];

    const allyChampionRating = !config.ignoreChampionWinrates
        ? analyzeChampions(dataset, fullDataset, team, priorGames)
        : { totalRating: 0, winrate: 0, championResults: [] };
    const enemyChampionRating = !config.ignoreChampionWinrates
        ? analyzeChampions(dataset, fullDataset, enemy, priorGames)
        : { totalRating: 0, winrate: 0, championResults: [] };

    const allyDuoRating = analyzeDuos(fullDataset, team, priorGames);
    const enemyDuoRating = analyzeDuos(fullDataset, enemy, priorGames);
    const matchupRating = analyzeMatchups(fullDataset, team, enemy, priorGames);

    const totalRating =
        allyChampionRating.totalRating +
        allyDuoRating.totalRating +
        matchupRating.totalRating -
        enemyChampionRating.totalRating -
        enemyDuoRating.totalRating;

    const winrate = ratingToWinrate(totalRating);

    return {
        allyChampionRating,
        enemyChampionRating,
        allyDuoRating,
        enemyDuoRating,
        matchupRating,
        totalRating,
        winrate,
    };
}

export type AnalyzeChampionResult = {
    role: Role;
    championKey: string;
    rating: number;
    wins: number;
    games: number;
};

export type AnalyzeChampionsResult = {
    championResults: AnalyzeChampionResult[];
    totalRating: number;
};

export function analyzeChampions(
    dataset: Dataset,
    synergyMatchupDataset: Dataset,
    team: Map<Role, string>,
    priorGames: number
): AnalyzeChampionsResult {
    const championResults: AnalyzeChampionResult[] = [];
    let totalRating = 0;

    for (const [role, championKey] of team) {
        const championResult = analyzeChampion(
            dataset,
            synergyMatchupDataset,
            role,
            championKey,
            priorGames
        );

        championResults.push(championResult);
        totalRating += championResult.rating;
    }

    return {
        championResults,
        totalRating,
    };
}

export function analyzeChampion(
    dataset: Dataset,
    fullDataset: Dataset,
    role: Role,
    championKey: string,
    priorGames: number
) {
    // Get stats for this patch
    const championData = dataset.championData[championKey];
    const roleData = championData.statsByRole[role];

    // Get stats for the full dataset (30days)
    const fullChampionData = fullDataset.championData[championKey];
    const fullChampionRoleData = fullChampionData.statsByRole[role];
    const fullChampionRoleWinrate =
        fullChampionRoleData.wins / fullChampionRoleData.games;

    const stats = addStats(
        {
            wins: roleData.wins,
            games: roleData.games,
        },
        // Scale prior stats by winrate of expected rating, as we expect the champion to have a similar winrate to the expected rating
        // We estimate the expected rating to be the rank winrate
        {
            wins: priorGames * fullChampionRoleWinrate,
            games: priorGames,
        }
        // TOOD: if 30 days has no games, add other prior games
    );

    const rating = winrateToRating(stats.wins / stats.games);

    return {
        role,
        championKey,
        rating,
        wins: roleData.wins,
        games: roleData.games,
    };
}

export type AnalyzeDuoResult = {
    roleA: Role;
    championKeyA: string;
    roleB: Role;
    championKeyB: string;
    rating: number;
    wins: number;
    games: number;
};

export type AnalyzeDuosResult = {
    duoResults: AnalyzeDuoResult[];
    totalRating: number;
};

export function analyzeDuos(
    dataset: Dataset,
    team: Map<Role, string>,
    priorGames: number
): AnalyzeDuosResult {
    const teamEntries = Array.from(team.entries()).sort((a, b) => a[0] - b[0]);

    const duoResults: AnalyzeDuoResult[] = [];
    let totalRating = 0;

    for (let i = 0; i < teamEntries.length; i++) {
        for (let j = i + 1; j < teamEntries.length; j++) {
            const [role, championKey] = teamEntries[i];
            const [role2, championKey2] = teamEntries[j];
            const roleStats = getStats(dataset, championKey, role);
            const champion2RoleStats = getStats(dataset, championKey2, role2);
            const expectedRating =
                winrateToRating(roleStats.wins / roleStats.games) +
                winrateToRating(
                    champion2RoleStats.wins / champion2RoleStats.games
                );
            const expectedWinrate = ratingToWinrate(expectedRating);

            const duoStats = getStats(
                dataset,
                championKey,
                role,
                "duo",
                role2,
                championKey2
            );
            const champion2DuoStats = getStats(
                dataset,
                championKey2,
                role2,
                "duo",
                role,
                championKey
            );
            const combinedStats = averageStats(duoStats, champion2DuoStats);

            const adjustedStats = addStats(combinedStats, {
                wins: priorGames * expectedWinrate,
                games: priorGames,
            });
            const winrate = adjustedStats.wins / adjustedStats.games;

            const actualRating = winrateToRating(winrate);
            const rating = actualRating - expectedRating;

            duoResults.push({
                roleA: role,
                championKeyA: championKey,
                roleB: role2,
                championKeyB: championKey2,
                rating,
                wins:
                    ratingToWinrate(
                        winrateToRating(
                            combinedStats.wins / combinedStats.games
                        ) - expectedRating
                    ) * combinedStats.games,
                games: combinedStats.games,
            });
            totalRating += rating;
        }
    }

    return {
        duoResults,
        totalRating,
    };
}

export type AnalyzeMatchupResult = {
    roleA: Role;
    championKeyA: string;
    roleB: Role;
    championKeyB: string;
    rating: number;
    wins: number;
    games: number;
};

export type AnalyzeMatchupsResult = {
    matchupResults: AnalyzeMatchupResult[];
    totalRating: number;
};

export function analyzeMatchups(
    dataset: Dataset,
    team: Map<Role, string>,
    enemy: Map<Role, string>,
    priorGames: number
): AnalyzeMatchupsResult {
    const matchupResults: AnalyzeMatchupResult[] = [];
    let totalRating = 0;

    for (const [allyRole, allyChampionKey] of team) {
        for (const [enemyRole, enemyChampionKey] of enemy) {
            const roleStats = getStats(dataset, allyChampionKey, allyRole);
            const enemyRoleStats = getStats(
                dataset,
                enemyChampionKey,
                enemyRole
            );

            const expectedRating =
                winrateToRating(roleStats.wins / roleStats.games) -
                winrateToRating(enemyRoleStats.wins / enemyRoleStats.games);
            const expectedWinrate = ratingToWinrate(expectedRating);

            const matchupStats = getStats(
                dataset,
                allyChampionKey,
                allyRole,
                "matchup",
                enemyRole,
                enemyChampionKey
            );
            const enemyMatchupStats = getStats(
                dataset,
                enemyChampionKey,
                enemyRole,
                "matchup",
                allyRole,
                allyChampionKey
            );
            const enemyLosses =
                enemyMatchupStats.games - enemyMatchupStats.wins;

            const wins = (matchupStats.wins + enemyLosses) / 2;
            const games = (matchupStats.games + enemyMatchupStats.games) / 2;

            const adjustedStats = addStats(
                {
                    wins,
                    games,
                },
                {
                    wins: priorGames * expectedWinrate,
                    games: priorGames,
                }
            );
            const winrate = adjustedStats.wins / adjustedStats.games;

            const actualRating = winrateToRating(winrate);
            const rating = actualRating - expectedRating;

            matchupResults.push({
                roleA: allyRole,
                championKeyA: allyChampionKey,
                roleB: enemyRole,
                championKeyB: enemyChampionKey,
                rating,
                wins:
                    ratingToWinrate(
                        winrateToRating(wins / games) - expectedRating
                    ) * games,
                games,
            });
            totalRating += rating;
        }
    }

    return {
        matchupResults,
        totalRating,
    };
}
