import { ChampionData, ChampionRoleData } from "../models/ChampionData";
import { Role, ROLES } from "../models/Role";

export function getTeamComps(champions: ChampionData[]) {
    return getTeamCompsRecursive([new Map(), 1], champions).sort(
        ([_, a], [__, b]) => b - a
    );
}

function getTeamCompsRecursive(
    [partialTeamComp, partialProbability]: [Map<Role, string>, number],
    champions: ChampionData[]
): [Map<Role, string>, number][] {
    if (champions.length === 0) {
        return [[partialTeamComp, partialProbability]];
    }

    const champion = champions[0];
    const remainingChampions = champions.slice(1);

    const totalGames = ROLES.reduce(
        (a, b) => a + champion.statsByRole[b].games,
        0
    );

    const combinations = [];
    for (const [role, roleData] of Object.entries(champion.statsByRole) as [
        Role,
        ChampionRoleData
    ][]) {
        if (partialTeamComp.has(role)) {
            continue;
        }

        const roleProbability = roleData.games / totalGames;

        const newPartialTeamComp = new Map(partialTeamComp);
        newPartialTeamComp.set(role, champion.key);
        combinations.push(
            ...getTeamCompsRecursive(
                [newPartialTeamComp, partialProbability * roleProbability],
                remainingChampions
            )
        );
    }

    return combinations;
}

export default function predictRoles(
    teamComps: [Map<Role, string>, number][]
): Map<string, Map<Role, number>> {
    const totalProbability = teamComps.reduce(
        (sum, teamComp) => sum + teamComp[1],
        0
    );

    const probabilities = new Map<string, Map<Role, number>>();

    for (const [championRoles, probability] of teamComps) {
        for (const [role, championKey] of championRoles) {
            if (!probabilities.has(championKey)) {
                probabilities.set(championKey, new Map());
            }

            const championProbabilities = probabilities.get(championKey)!;
            championProbabilities.set(
                role,
                (championProbabilities.get(role) ?? 0) +
                    probability / totalProbability
            );
        }
    }

    return probabilities;
}
