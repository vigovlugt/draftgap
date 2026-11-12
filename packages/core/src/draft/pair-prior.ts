import { Dataset } from "../models/dataset/Dataset";
import { Role, ROLES } from "../models/Role";
import { ratingToWinrate, winrateToRating } from "../rating/ratings";
import { priorGamesByRiskLevel } from "../risk/risk-level";

// The prior games of a duo or matchup at the medium risk level, by the roles of the two champions
export type PairPriorGames = {
    duo: Record<Role, Record<Role, number>>;
    matchup: Record<Role, Record<Role, number>>;
};

type Deviation = {
    // Difference between the winrate of the pair and its expected winrate
    deviation: number;
    // Variance of that difference caused by the limited amount of games
    variance: number;
    games: number;
};

// The winrate of a champion with fewer games is too uncertain to compare its pairs against
const MIN_CHAMPION_GAMES = 3000;
const MIN_PAIR_GAMES = 20;
// Role combinations with fewer pairs keep the default prior games
const MIN_PAIRS = 200;
const MIN_PRIOR_GAMES = 250;
const MAX_PRIOR_GAMES = 30000;

/*
The prior games say how many games are needed before the winrate of a pair is trusted,
which depends on how much pairs with these roles really differ from their expected winrate:
a top versus top matchup matters more than a top and middle duo.
The variance of the real differences is the variance of the observed differences,
minus the variance that is caused by the limited amount of games.
*/
function getPriorGames(deviations: Deviation[], defaultPriorGames: number) {
    if (deviations.length < MIN_PAIRS) {
        return defaultPriorGames;
    }

    let games = 0;
    let deviationSum = 0;
    for (const d of deviations) {
        games += d.games;
        deviationSum += d.games * d.deviation;
    }
    const mean = deviationSum / games;

    let varianceSum = 0;
    for (const d of deviations) {
        varianceSum += d.games * ((d.deviation - mean) ** 2 - d.variance);
    }
    const variance = varianceSum / games;
    if (variance <= 0) {
        return MAX_PRIOR_GAMES;
    }

    // Variance of a single game with a 50% winrate / variance of the real differences
    return Math.min(
        Math.max(0.25 / variance, MIN_PRIOR_GAMES),
        MAX_PRIOR_GAMES,
    );
}

function createRoleTable<T>(create: () => T) {
    return Object.fromEntries(
        ROLES.map((role) => [
            role,
            Object.fromEntries(ROLES.map((role2) => [role2, create()])),
        ]),
    ) as Record<Role, Record<Role, T>>;
}

export function estimatePairPriorGames(dataset: Dataset): PairPriorGames {
    const defaultPriorGames = priorGamesByRiskLevel["medium"];

    const getRating = (championKey: string, role: Role) => {
        const stats = dataset.championData[championKey]?.statsByRole[role];
        if (!stats || stats.games < MIN_CHAMPION_GAMES) return undefined;

        return winrateToRating(stats.wins / stats.games);
    };

    // Both champions see the same pair, so the roles are stored in order
    const duoDeviations = createRoleTable<Deviation[]>(() => []);
    const matchupDeviations = createRoleTable<Deviation[]>(() => []);
    const addDeviation = (
        deviations: Record<Role, Record<Role, Deviation[]>>,
        role: Role,
        role2: Role,
        stats: { wins: number; games: number },
        expectedRating: number,
    ) => {
        if (stats.games < MIN_PAIR_GAMES) return;

        const expectedWinrate = ratingToWinrate(expectedRating);
        deviations[Math.min(role, role2) as Role][
            Math.max(role, role2) as Role
        ].push({
            deviation: stats.wins / stats.games - expectedWinrate,
            variance: (expectedWinrate * (1 - expectedWinrate)) / stats.games,
            games: stats.games,
        });
    };

    for (const championKey of Object.keys(dataset.championData)) {
        for (const role of ROLES) {
            const rating = getRating(championKey, role);
            if (rating === undefined) continue;

            const roleData = dataset.championData[championKey].statsByRole[role];
            for (const role2 of ROLES) {
                for (const matchup of Object.values(
                    roleData.matchup?.[role2] ?? {},
                )) {
                    const rating2 = getRating(matchup.championKey, role2);
                    if (rating2 === undefined) continue;

                    addDeviation(
                        matchupDeviations,
                        role,
                        role2,
                        matchup,
                        rating - rating2,
                    );
                }

                for (const duo of Object.values(
                    roleData.synergy?.[role2] ?? {},
                )) {
                    const rating2 = getRating(duo.championKey, role2);
                    if (rating2 === undefined) continue;

                    addDeviation(
                        duoDeviations,
                        role,
                        role2,
                        duo,
                        rating + rating2,
                    );
                }
            }
        }
    }

    const duo = createRoleTable(() => defaultPriorGames);
    const matchup = createRoleTable(() => defaultPriorGames);
    for (const role of ROLES) {
        for (const role2 of ROLES) {
            if (role2 < role) continue;

            duo[role][role2] = duo[role2][role] = getPriorGames(
                duoDeviations[role][role2],
                defaultPriorGames,
            );
            matchup[role][role2] = matchup[role2][role] = getPriorGames(
                matchupDeviations[role][role2],
                defaultPriorGames,
            );
        }
    }

    return { duo, matchup };
}

const pairPriorGamesByDataset = new WeakMap<Dataset, PairPriorGames>();

// The estimate goes over all pairs of the dataset, so it is only made once per dataset
export function getPairPriorGames(dataset: Dataset) {
    let pairPriorGames = pairPriorGamesByDataset.get(dataset);
    if (!pairPriorGames) {
        pairPriorGames = estimatePairPriorGames(dataset);
        pairPriorGamesByDataset.set(dataset, pairPriorGames);
    }

    return pairPriorGames;
}
