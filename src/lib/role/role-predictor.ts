import { Role, ROLES } from "../models/Role";
import { ChampionData } from "../models/dataset/ChampionData";

export function getTeamComps(champions: (ChampionData & { role?: Role })[]) {
    const existingTeam = new Map(
        champions
            .filter((c) => c.role !== undefined)
            .map((c) => [c.role!, c.key])
    );

    return getTeamCompsRecursive(
        [existingTeam, 1],
        champions.filter((c) => c.role === undefined)
    ).sort(([, a], [, b]) => b - a);
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

    const totalGames = ROLES.reduce<number>(
        (a, b) => a + champion.statsByRole[b].games,
        0
    );

    const combinations = [];
    for (const entry of Object.entries(champion.statsByRole)) {
        const role = Number(entry[0]) as Role;
        const roleData = entry[1];
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
