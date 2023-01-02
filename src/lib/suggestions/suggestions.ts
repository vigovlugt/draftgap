import { ChampionData } from "../models/ChampionData";
import { Dataset } from "../models/Dataset";
import { Role, ROLES } from "../models/Role";
import { winrateToRating, ratingToWinrate } from "../rating/ratings";
import { calculateWilsonCI } from "../statistics/stats";

const WINRATE_CONFIDENCE = 0;

const PRIOR_GAMES = 1000;

export interface Suggestion {
    championKey: string;
    role: Role;
    draftResult: DraftResult;
}

export function getSuggestions(
    dataset: Dataset,
    team: Map<Role, string>,
    enemy: Map<Role, string>,
    config: AnalyzeDraftConfig
) {
    const remainingRoles = ROLES.filter((role) => !team.has(role));
    const enemyChampions = new Set(enemy.values());
    const allyChampions = new Set(team.values());

    const suggestions: Suggestion[] = [];

    for (const championKey of Object.keys(dataset.championData)) {
        if (enemyChampions.has(championKey) || allyChampions.has(championKey))
            continue;

        for (const role of remainingRoles) {
            if (team.has(role)) continue;
            if (getStats(dataset, championKey, role).games < 1000) continue;

            team.set(role, championKey);
            const draftResult = analyzeDraft(dataset, team, enemy, config);
            team.delete(role);

            suggestions.push({
                championKey,
                role,
                draftResult,
            });
        }
    }

    return suggestions.sort(
        (a, b) => b.draftResult.winrate - a.draftResult.winrate
    );
}

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
}

export function analyzeDraft(
    championDataset: Dataset,
    team: Map<Role, string>,
    enemy: Map<Role, string>,
    config: AnalyzeDraftConfig
): DraftResult {
    const allyChampionRating = !config.ignoreChampionWinrates
        ? analyzeChampions(championDataset, team)
        : { totalRating: 0, winrate: 0, championResults: [] };
    const enemyChampionRating = !config.ignoreChampionWinrates
        ? analyzeChampions(championDataset, enemy)
        : { totalRating: 0, winrate: 0, championResults: [] };

    const allyDuoRating = analyzeDuos(championDataset, team);
    const enemyDuoRating = analyzeDuos(championDataset, enemy);
    const matchupRating = analyzeMatchups(championDataset, team, enemy);

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
    winrate: number;
    rating: number;
};

export type AnalyzeChampionsResult = {
    championResults: AnalyzeChampionResult[];
    totalRating: number;
};

export function analyzeChampions(
    championDataset: Dataset,
    team: Map<Role, string>
): AnalyzeChampionsResult {
    const championResults: AnalyzeChampionResult[] = [];
    let totalRating = 0;

    for (const [role, championKey] of team) {
        const championData = championDataset.championData[championKey];
        const roleData = championData.statsByRole[role];

        const winrate = calculateWilsonCI(
            roleData.wins,
            roleData.games,
            WINRATE_CONFIDENCE
        )[0];
        const rating = winrateToRating(winrate);
        championResults.push({ role, championKey, rating, winrate });
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
    winrate: number;
    rating: number;
    priorStats: {
        wins: number;
        games: number;
        winrate: number;
        rating: number;
    };
    posteriorStats: {
        wins: number;
        games: number;
        winrate: number;
        rating: number;
    };
};

export type AnalyzeDuosResult = {
    duoResults: AnalyzeDuoResult[];
    totalRating: number;
};

export function analyzeDuos(
    dataset: Dataset,
    team: Map<Role, string>
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
                addStats(duoStats, champion2DuoStats),
                2
            );

            const stats = addStats(
                combinedStats,
                // Scale prior stats by winrate of expected rating, as we expect the duo to have a similar winrate to the expected rating
                {
                    wins: PRIOR_GAMES * ratingToWinrate(expectedRating),
                    games: PRIOR_GAMES,
                }
            );
            const winrate = stats.wins / stats.games;

            const actualRating = winrateToRating(winrate);
            const rating = actualRating - expectedRating;

            duoResults.push({
                roleA: role,
                championKeyA: championKey,
                roleB: role2,
                championKeyB: championKey2,
                winrate,
                rating,
                priorStats: {
                    ...combinedStats,
                    winrate: combinedStats.wins / combinedStats.games,
                    rating: winrateToRating(
                        combinedStats.wins / combinedStats.games
                    ),
                },
                posteriorStats: {
                    ...stats,
                    winrate: stats.wins / stats.games,
                    rating: winrateToRating(stats.wins / stats.games),
                },
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
    winrate: number;
    rating: number;
};

export type AnalyzeMatchupsResult = {
    matchupResults: AnalyzeMatchupResult[];
    totalRating: number;
};

export function analyzeMatchups(
    dataset: Dataset,
    team: Map<Role, string>,
    enemy: Map<Role, string>
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
                    wins: (matchupStats.wins + enemyLosses) / 2,
                    games: (matchupStats.games + enemyMatchupStats.games) / 2,
                },
                {
                    wins: PRIOR_GAMES * ratingToWinrate(expectedRating),
                    games: PRIOR_GAMES,
                }
            );
            const winrate = stats.wins / stats.games;

            const actualRating = winrateToRating(winrate);
            const rating = actualRating - expectedRating;

            matchupResults.push({
                roleA: allyRole,
                championKeyA: allyChampionKey,
                roleB: enemyRole,
                championKeyB: enemyChampionKey,
                winrate,
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

function addStats(
    stats: { wins: number; games: number },
    stats2: { wins: number; games: number }
) {
    return {
        wins: stats.wins + stats2.wins,
        games: stats.games + stats2.games,
    };
}

function divideStats(stats: { wins: number; games: number }, number: number) {
    return {
        wins: stats.wins / number,
        games: stats.games / number,
    };
}

function getStats(
    dataset: Dataset,
    championKey: string,
    role: Role
): { wins: number; games: number };
function getStats(
    dataset: Dataset,
    championKey: string,
    role: Role,
    type: "duo",
    role2: Role,
    championKey2: string
): { wins: number; games: number };
function getStats(
    dataset: Dataset,
    championKey: string,
    role: Role,
    type: "matchup",
    role2: Role,
    championKey2: string
): { wins: number; games: number };
function getStats(
    dataset: Dataset,
    championKey: string,
    role: Role,
    type?: "matchup" | "duo",
    matchupDuoRole?: Role,
    matchupDuoChampionKey?: string
) {
    if (!type) {
        return (
            dataset.championData[championKey].statsByRole[role] ?? {
                wins: 0,
                games: 0,
            }
        );
    }

    if (type === "matchup") {
        matchupDuoRole = matchupDuoRole!;
        matchupDuoChampionKey = matchupDuoChampionKey!;
        return (
            dataset.championData[championKey].statsByRole[role]?.matchup[
                matchupDuoRole
            ][matchupDuoChampionKey] ?? {
                wins: 0,
                games: 0,
            }
        );
    } else {
        matchupDuoRole = matchupDuoRole!;
        matchupDuoChampionKey = matchupDuoChampionKey!;

        return (
            dataset.championData[championKey].statsByRole[role].synergy[
                matchupDuoRole
            ][matchupDuoChampionKey] ?? {
                wins: 0,
                games: 0,
            }
        );
    }
}
