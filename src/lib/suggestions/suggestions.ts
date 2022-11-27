import { ChampionData } from "../models/ChampionData";
import { Dataset } from "../models/Dataset";
import { Role, ROLES } from "../models/Role";
import { winrateToRating, ratingToWinrate } from "../rating/ratings";
import { calculateWilsonCI } from "../statistics/stats";

const WINRATE_CONFIDENCE = 0;

export interface Suggestion {
    championKey: string;
    role: Role;
    draftResult: DraftResult;
}

export function getSuggestions(
    championDataset: Dataset,
    team: Map<Role, string>,
    enemy: Map<Role, string>,
    config: AnalyzeDraftConfig
) {
    const remainingRoles = ROLES.filter((role) => !team.has(role));
    const enemyChampions = new Set(enemy.values());
    const allyChampions = new Set(team.values());

    const suggestions: Suggestion[] = [];

    for (const championKey of Object.keys(championDataset.championData)) {
        if (enemyChampions.has(championKey) || allyChampions.has(championKey))
            continue;

        const champion = championDataset.championData[championKey];

        for (const role of remainingRoles) {
            if (team.has(role)) continue;

            const championRoleData = champion.statsByRole[role];

            // Check if all champions in the enemy team have a matchup against the champion
            const championHasMatchups = [...enemy.entries()].every(
                ([enemyRole, enemyChampionKey]) => {
                    const enemyChampion =
                        championDataset.championData[enemyChampionKey];
                    const enemyChampionRoleData =
                        enemyChampion.statsByRole[enemyRole];
                    return (
                        (championRoleData.matchup[enemyRole]?.[enemyChampionKey]
                            ?.games ?? 0) > 1000 &&
                        (enemyChampionRoleData.matchup[role]?.[championKey]
                            ?.games ?? 0) > 1000
                    );
                }
            );
            if (!championHasMatchups) continue;

            // Check if all champions in the team have a synergy with the champion
            const teamHasSynergy = [...team.entries()].every(
                ([allyRole, allyChampionKey]) => {
                    const allyChampion =
                        championDataset.championData[allyChampionKey];
                    const allyChampionRoleData =
                        allyChampion.statsByRole[allyRole];

                    return (
                        (allyChampionRoleData.synergy[role]?.[championKey]
                            ?.games ?? 0) > 1000 &&
                        (championRoleData.synergy[allyRole]?.[allyChampionKey]
                            ?.games ?? 0) > 1000
                    );
                }
            );
            if (!teamHasSynergy) continue;

            team.set(role, championKey);
            const draftResult = analyzeDraft(
                championDataset,
                team,
                enemy,
                config
            );
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
};

export type AnalyzeDuosResult = {
    duoResults: AnalyzeDuoResult[];
    totalRating: number;
};

export function analyzeDuos(
    championDataset: Dataset,
    team: Map<Role, string>
): AnalyzeDuosResult {
    const teamEntries = Array.from(team.entries());

    const duoResults: AnalyzeDuoResult[] = [];
    let totalRating = 0;

    for (let i = 0; i < teamEntries.length; i++) {
        for (let j = i + 1; j < teamEntries.length; j++) {
            const [role, championKey] = teamEntries[i];
            const [role2, championKey2] = teamEntries[j];
            const roleStats =
                championDataset.championData[championKey].statsByRole[role];
            const champion2RoleStats =
                championDataset.championData[championKey2].statsByRole[role2];
            const duoStats = roleStats.synergy[role2][championKey2];
            const chapmion2DuoStats =
                champion2RoleStats.synergy[role][championKey];

            const wins = (duoStats.wins + chapmion2DuoStats.wins) / 2;
            const games = (duoStats.games + chapmion2DuoStats.games) / 2;
            const winrate = calculateWilsonCI(
                wins,
                games,
                WINRATE_CONFIDENCE
            )[0];

            const expectedRating =
                winrateToRating(roleStats.wins / roleStats.games) +
                winrateToRating(
                    champion2RoleStats.wins / champion2RoleStats.games
                );

            const actualRating = winrateToRating(winrate);

            const rating = actualRating - expectedRating;

            duoResults.push({
                roleA: role,
                championKeyA: championKey,
                roleB: role2,
                championKeyB: championKey2,
                winrate,
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
            const roleStats =
                dataset.championData[allyChampionKey].statsByRole[allyRole];
            const matchupStats = roleStats.matchup[enemyRole][enemyChampionKey];

            const enemyRoleStats =
                dataset.championData[enemyChampionKey].statsByRole[enemyRole];
            const enemyMatchupStats =
                enemyRoleStats.matchup[allyRole][allyChampionKey];

            const enemyLosses =
                enemyMatchupStats.games - enemyMatchupStats.wins;
            const wins = (matchupStats.wins + enemyLosses) / 2;
            const games = (matchupStats.games + enemyMatchupStats.games) / 2;

            const winrate = calculateWilsonCI(
                wins,
                games,
                WINRATE_CONFIDENCE
            )[0];
            const actualRating = winrateToRating(winrate);

            const expectedRating =
                winrateToRating(roleStats.wins / roleStats.games) -
                winrateToRating(enemyRoleStats.wins / enemyRoleStats.games);

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
