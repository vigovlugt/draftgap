import { Dataset } from "../models/dataset/Dataset";
import { Role } from "../models/Role";
import { winrateToRating, ratingToWinrate } from "../rating/ratings";
import { RiskLevel, priorGamesByRiskLevel } from "../risk/risk-level";
import { addStats, divideStats } from "../stats";
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

    const rankWinrate = dataset.rankData.wins / dataset.rankData.games;
    const rankRating = winrateToRating(rankWinrate);

    const synergyMatchupRankWinrate =
        synergyMatchupDataset.rankData.wins /
        synergyMatchupDataset.rankData.games;
    const synergyMatchupRankRating = winrateToRating(synergyMatchupRankWinrate);

    for (const [role, championKey] of team) {
        const championData = dataset.championData[championKey];
        const roleData = championData.statsByRole[role];

        const synergyMatchupChampionData =
            synergyMatchupDataset.championData[championKey];
        const synergyMatchupRoleData =
            synergyMatchupChampionData.statsByRole[role];

        const roleWinrate = roleData.wins / roleData.games;
        // Real role winrate is the role winrate adjusted for the rank winrate bias
        const realRoleWinrate = ratingToWinrate(
            winrateToRating(roleWinrate) - rankRating
        );
        const synergyMatchupRoleWinrate =
            synergyMatchupRoleData.wins / synergyMatchupRoleData.games;
        const realSynergyMatchupRoleWinrate = ratingToWinrate(
            winrateToRating(synergyMatchupRoleWinrate) -
                synergyMatchupRankRating
        );

        const stats = addStats(
            {
                wins: roleData.games * realRoleWinrate,
                games: roleData.games,
            },
            // Scale prior stats by winrate of expected rating, as we expect the champion to have a similar winrate to the expected rating
            // We estimate the expected rating to be the rank winrate
            {
                wins: priorGames * realSynergyMatchupRoleWinrate,
                games: priorGames,
            }
        );
        const rating = winrateToRating(stats.wins / stats.games);
        championResults.push({ role, championKey, rating });
        totalRating += rating;
    }

    return {
        championResults,
        totalRating,
    };
}

export type AnalyzeDuoResult = {
    roleA: Role;
    championKeyA: string;
    roleB: Role;
    championKeyB: string;
    rating: number;
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

    const rankRating = winrateToRating(
        dataset.rankData.wins / dataset.rankData.games
    );

    for (let i = 0; i < teamEntries.length; i++) {
        for (let j = i + 1; j < teamEntries.length; j++) {
            const [role, championKey] = teamEntries[i];
            const [role2, championKey2] = teamEntries[j];
            const roleStats = getStats(dataset, championKey, role);
            const champion2RoleStats = getStats(dataset, championKey2, role2);
            const expectedRating =
                winrateToRating(roleStats.wins / roleStats.games) -
                rankRating +
                (winrateToRating(
                    champion2RoleStats.wins / champion2RoleStats.games
                ) -
                    rankRating);

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
            const combinedStats = divideStats(
                // Adding two stats keeps only 1 rank winrate bias
                addStats(duoStats, champion2DuoStats),
                2
            );

            const stats = addStats(
                combinedStats,
                // Scale prior stats by winrate of expected rating, as we expect the duo to have a similar winrate to the expected rating
                {
                    wins:
                        priorGames *
                        ratingToWinrate(expectedRating + rankRating),
                    games: priorGames,
                }
            );
            const winrate = stats.wins / stats.games;

            const actualRating = winrateToRating(winrate) - rankRating;
            const rating = actualRating - expectedRating;

            duoResults.push({
                roleA: role,
                championKeyA: championKey,
                roleB: role2,
                championKeyB: championKey2,
                rating,
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

    const rankRating = winrateToRating(
        dataset.rankData.wins / dataset.rankData.games
    );

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
                rankRating -
                (winrateToRating(enemyRoleStats.wins / enemyRoleStats.games) -
                    rankRating);

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
            const stats = addStats(
                {
                    // Summing the wins and losses of the two matchups cancels the rank winrate bias of both matchups
                    wins: (matchupStats.wins + enemyLosses) / 2,
                    games: (matchupStats.games + enemyMatchupStats.games) / 2,
                },
                {
                    wins: priorGames * ratingToWinrate(expectedRating),
                    games: priorGames,
                }
            );
            const winrate = stats.wins / stats.games;

            // We don't need to subtract the rank rating here, as we already did it for the expected rating
            const actualRating = winrateToRating(winrate);
            const rating = actualRating - expectedRating;

            matchupResults.push({
                roleA: allyRole,
                championKeyA: allyChampionKey,
                roleB: enemyRole,
                championKeyB: enemyChampionKey,
                rating,
            });
            totalRating += rating;
        }
    }

    return {
        matchupResults,
        totalRating,
    };
}