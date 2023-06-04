import { ChampionData } from "../../../../packages/draftgap-core/src/models/dataset/ChampionData";
import { ChampionSynergyData } from "../../../../packages/draftgap-core/src/models/dataset/ChampionSynergyData";
import { ChampionMatchupData } from "../../../../packages/draftgap-core/src/models/dataset/ChampionMatchupData";
import {
    getRoleFromString,
    Role,
} from "../../../../packages/draftgap-core/src/models/Role";
import { getLolalyticsChampion } from "./champion";
import { getLolalyticsChampion2 } from "./champion2";
import {
    ChampionRoleData,
    defaultChampionRoleData,
} from "../../../../packages/draftgap-core/src/models/dataset/ChampionRoleData";
import { LOLALYTICS_ROLES, LolalyticsRole } from "./roles";

export async function getChampionDataFromLolalytics(
    version: string,
    champion: { id: string; key: string; name: string }
) {
    const [championData, champion2Data] = await Promise.all([
        getLolalyticsChampion(version, champion.key),
        getLolalyticsChampion2(version, champion.key),
    ]);

    // If data is not available, throw
    if (!championData.skills) {
        return undefined;
        //throw new Error("No data available for this champion and patch");
    }

    const mainRole = championData.header.lane as LolalyticsRole;
    const remainingRoles = LOLALYTICS_ROLES.filter(
        (role) => role !== championData.header.lane
    );

    const rolePromises = remainingRoles.map((role) =>
        Promise.all([
            getLolalyticsChampion(version, champion.key, role),
            getLolalyticsChampion2(version, champion.key, role),
        ])
    );
    const roleDataResults = await Promise.allSettled(rolePromises);

    let roleData = roleDataResults.map((result, i) => {
        if (result.status === "fulfilled") {
            return [remainingRoles[i], result.value] as const;
        }

        return [remainingRoles[i], undefined] as const;
    });
    roleData = [[mainRole, [championData, champion2Data]], ...roleData];

    const model: ChampionData = {
        ...champion,
        statsByRole: Object.fromEntries(
            roleData.map(([role, data]) => {
                if (!data || data[0].header.n === 0) {
                    return [getRoleFromString(role), defaultChampionRoleData()];
                }

                const [championData, champion2Data] = data;

                const championRoleData: ChampionRoleData = {
                    games: championData.header.n,
                    wins: Math.round(
                        (championData.header.n * championData.header.wr) / 100
                    ),
                    matchup: Object.fromEntries(
                        LOLALYTICS_ROLES.map((role) => {
                            const data = championData[`enemy_${role}`];
                            if (!data) {
                                console.log(championData);
                            }

                            return [
                                getRoleFromString(role),
                                Object.fromEntries(
                                    data.map((d) => {
                                        const matchup: ChampionMatchupData = {
                                            championKey: d[0].toString(),
                                            games: d[1],
                                            wins: d[2],
                                        };

                                        return [d[0], matchup];
                                    })
                                ),
                            ];
                        })
                    ) as Record<Role, Record<string, ChampionMatchupData>>,
                    synergy: Object.fromEntries(
                        LOLALYTICS_ROLES.filter((r) => r !== role).map(
                            (synergyRole) => {
                                const data =
                                    champion2Data[`team_${synergyRole}`]!;

                                return [
                                    getRoleFromString(synergyRole),
                                    Object.fromEntries(
                                        data.map((d) => {
                                            const synergy: ChampionSynergyData =
                                                {
                                                    championKey:
                                                        d[0].toString(),
                                                    games: d[1],
                                                    wins: d[2],
                                                };

                                            return [d[0], synergy];
                                        })
                                    ),
                                ];
                            }
                        )
                    ) as Record<Role, Record<string, ChampionSynergyData>>,
                    damageProfile: championData.header.damage,
                };

                return [getRoleFromString(role), championRoleData];
            })
        ) as Record<Role, ChampionRoleData>,
    };

    return model;
}

/*
Matchup stats are vs champions of every rank, not just the rank of the player
We try to fix this by getting the data of the matchup for the other champion
And then use the average of the two.
*/
// export function distributeMatchupWinrates(
//     dataset: Dataset
// ) {
//     for (const championKey of Object.keys(dataset)) {
//         const champion = dataset[championKey];
//         for (const role of Object.keys(champion.statsByRole)) {
//             const roleStats = champion.statsByRole[role as Role];

//             for (const matchupRole of Object.keys(roleStats.matchup)) {
//                 const matchup = roleStats.matchup[matchupRole as Role];
//                 for (const matchupChampion of Object.keys(matchup)) {
//                     const matchupChampionStats = matchup[matchupChampion];

//                     const reverseMatchupStats =
//                         dataset[matchupChampion].statsByRole[
//                             matchupRole as Role
//                         ].matchup[role as Role][championKey];

//                     if (!reverseMatchupStats) continue;

//                     matchupChampionStats.games =
//                         (matchupChampionStats.games +
//                             reverseMatchupStats.games) /
//                         2;
//                     matchupChampionStats.wins =
//                         (matchupChampionStats.wins + reverseMatchupStats.wins) /
//                         2;
//                 }
//             }
//         }
//     }
// }
