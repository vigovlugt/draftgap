import { ChampionData } from "../models/ChampionData";
import { PickData } from "../models/PickData";
import { Role, ROLES } from "../models/Role";
import {
    getMatchupWinrate,
    getRatingDifference,
    getWinrateFromRatingDifference,
} from "../rating/ratings";

export interface Suggestion {
    championKey: string;
    role: Role;
    winrate: number;
}

export function getSuggestions(
    championDataset: Record<string, ChampionData>,
    team: Map<Role, string>,
    enemy: Map<Role, string>
) {
    const remainingRoles = ROLES.filter((role) => !team.has(role));
    const enemyChampions = new Set(enemy.values());
    const allyChampions = new Set(team.values());

    const suggestions: Suggestion[] = [];

    for (const championKey of Object.keys(championDataset)) {
        if (enemyChampions.has(championKey) || allyChampions.has(championKey))
            continue;

        for (const role of remainingRoles) {
            if (team.has(role)) continue;

            const roleStats = championDataset[championKey].statsByRole[role];
            if (roleStats.games < 1000) continue;

            team.set(role, championKey);
            const winrate = calculateWinrate(championDataset, team, enemy);
            team.delete(role);

            suggestions.push({
                championKey,
                role,
                winrate,
            });
        }
    }

    return suggestions.sort((a, b) => b.winrate - a.winrate);
}

export function calculateWinrate(
    championDataset: Record<string, ChampionData>,
    team: Map<Role, string>,
    enemy: Map<Role, string>
) {
    const allyRating = getTeamRatingSum(championDataset, team);
    const enemyRating = getTeamRatingSum(championDataset, enemy);

    const allyDuoRating = getDuoWinrateSum(championDataset, team);
    const enemyDuoRating = getDuoWinrateSum(championDataset, enemy);
    const matchupRating = getMatchupRatingSum(championDataset, team, enemy);

    return getWinrateFromRatingDifference(
        allyRating +
            allyDuoRating +
            matchupRating -
            enemyRating -
            enemyDuoRating
    );
}

export function getTeamRatingSum(
    championDataset: Record<string, ChampionData>,
    team: Map<Role, string>
) {
    let sum = 0;

    for (const [role, championKey] of team) {
        const championData = championDataset[championKey];
        const roleData = championData.statsByRole[role];

        sum += getRatingDifference(roleData.wins / roleData.games);
    }

    return sum;
}

export function getDuoWinrateSum(
    championDataset: Record<string, ChampionData>,
    team: Map<Role, string>
) {
    let sum = 0;
    const teamEntries = Array.from(team.entries());

    for (let i = 0; i < teamEntries.length; i++) {
        for (let j = i + 1; j < teamEntries.length; j++) {
            const [role, championKey] = teamEntries[i];
            const [role2, championKey2] = teamEntries[j];
            const roleStats = championDataset[championKey].statsByRole[role];
            const duoStats = roleStats.synergy[role2][championKey2];

            if (!duoStats || duoStats.games < 100) continue;
            sum += getRatingDifference(duoStats.wins / duoStats.games);
        }
    }

    return sum;
}

export function getMatchupRatingSum(
    championDataset: Record<string, ChampionData>,
    team: Map<Role, string>,
    enemy: Map<Role, string>
) {
    let sum = 0;

    for (const [allyRole, allyKey] of team) {
        for (const [enemyRole, enemyKey] of enemy) {
            const roleStats = championDataset[allyKey].statsByRole[allyRole];
            const matchupStats = roleStats.matchup[enemyRole][enemyKey];

            if (!matchupStats || matchupStats.games < 100) continue;
            sum += getRatingDifference(matchupStats.wins / matchupStats.games);
        }
    }

    return sum;
}
