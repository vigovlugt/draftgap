import { Role, ROLES } from "../models/Role";
import { Dataset } from "../models/dataset/Dataset";
import { DraftResult, AnalyzeDraftConfig, analyzeDraft } from "./analysis";
import { getStats } from "./utils";

export interface Suggestion {
    championKey: string;
    role: Role;
    draftResult: DraftResult;
}

export function getSuggestions(
    dataset: Dataset,
    synergyMatchupDataset: Dataset,
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
            if (
                (getStats(synergyMatchupDataset, championKey, role).games /
                    30) *
                    7 <
                config.minGames
            )
                continue;

            team.set(role, championKey);
            const draftResult = analyzeDraft(
                dataset,
                synergyMatchupDataset,
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
