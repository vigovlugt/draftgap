import {
    ChampionData,
    ChampionMatchupData,
    ChampionRoleData,
    ChampionSynergyData,
} from "../../models/ChampionData";
import { Role, ROLES } from "../../models/Role";
import { getLolalyticsChampion } from "./champion";
import { getLolalyticsChampion2 } from "./champion2";

const MIN_ROLE_PLAY_RATE = 10;

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
        throw new Error("No data available for this champion and patch");
    }

    const roles = Object.entries(championData.nav.lanes)
        .filter(([, value]) => value !== championData.header.lane)
        .map(([key, _]) => key) as Role[];

    const rolePromises = roles.map((role) =>
        Promise.all([
            getLolalyticsChampion(version, champion.key, role),
            getLolalyticsChampion2(version, champion.key, role),
        ])
    );
    const roleData = await Promise.all(rolePromises);

    const model: ChampionData = {
        ...champion,
        statsByRole: Object.fromEntries(
            roleData.map(([championData, champion2Data]) => {
                const role = championData.header.lane as Role;

                const championRoleData: ChampionRoleData = {
                    games: championData.header.n,
                    wins: Math.round(
                        (championData.header.n * championData.header.wr) / 100
                    ),
                    matchup: Object.fromEntries(
                        ROLES.map((role) => {
                            const data = championData[`enemy_${role}`];

                            return [
                                role,
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
                        ROLES.filter((r) => r !== championData.header.lane).map(
                            (role) => {
                                const data = champion2Data[`team_${role}`]!;

                                return [
                                    role,
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

                return [role, championRoleData];
            })
        ) as Record<Role, ChampionRoleData>,
    };

    return model;
}
