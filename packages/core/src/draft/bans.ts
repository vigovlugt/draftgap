import { Role } from "../models/Role";
import { Dataset } from "../models/dataset/Dataset";
import { Suggestion } from "./suggestions";
import { getStats } from "./utils";

export const MIN_ROLE_THREAT = 0.00005;

export type BanRoleThreat = {
    role: Role;
    probability: number;
    delta: number;
    threat: number;
};

export type BanSuggestion = {
    championKey: string;
    score: number;
    threats: BanRoleThreat[];
};

export function getBanSuggestions(
    dataset: Dataset,
    enemySuggestions: Suggestion[],
    unavailable: Set<string>,
    role?: Role,
) {
    const suggestionsByRole = new Map<Role, Suggestion[]>();
    for (const s of enemySuggestions) {
        if (unavailable.has(s.championKey)) continue;
        if (role !== undefined && s.role !== role) continue;
        suggestionsByRole.set(s.role, [
            ...(suggestionsByRole.get(s.role) ?? []),
            s,
        ]);
    }

    const threatsByChampion = new Map<string, BanRoleThreat[]>();
    for (const [role, suggestions] of suggestionsByRole) {
        const games = suggestions.map(
            (s) => getStats(dataset, s.championKey, role).games,
        );
        const totalGames = games.reduce((sum, g) => sum + g, 0);
        if (totalGames === 0) continue;

        const expectedWinrate = suggestions.reduce(
            (sum, s, i) =>
                sum + (games[i]! / totalGames) * s.draftResult.winrate,
            0,
        );

        suggestions.forEach((s, i) => {
            const probability = games[i]! / totalGames;
            const delta = s.draftResult.winrate - expectedWinrate;

            threatsByChampion.set(s.championKey, [
                ...(threatsByChampion.get(s.championKey) ?? []),
                { role, probability, delta, threat: probability * delta },
            ]);
        });
    }

    const banSuggestions: BanSuggestion[] = [];
    for (const [championKey, threats] of threatsByChampion) {
        threats.sort((a, b) => b.threat - a.threat);
        const mainThreats = threats.filter((t) => t.threat >= MIN_ROLE_THREAT);

        banSuggestions.push({
            championKey,
            score: threats.reduce((sum, t) => sum + Math.max(0, t.threat), 0),
            threats: mainThreats.length > 0 ? mainThreats : threats.slice(0, 1),
        });
    }

    return banSuggestions.sort((a, b) => b.score - a.score);
}
