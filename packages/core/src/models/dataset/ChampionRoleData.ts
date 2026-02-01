import { ChampionDamageProfile } from "./ChampionDamageProfile";
import { ChampionMatchupData } from "./ChampionMatchupData";
import { ChampionSynergyData } from "./ChampionSynergyData";
import { Role } from "../Role";

export interface ChampionRoleData {
    games: number;
    wins: number;
    matchup: Record<Role, Record<string, ChampionMatchupData>>;
    synergy: Record<Role, Record<string, ChampionSynergyData>>;
    damageProfile: ChampionDamageProfile;
    statsByTime: {
        wins: number;
        games: number;
    }[];
}

export function defaultChampionRoleData(): ChampionRoleData {
    return {
        games: 0,
        wins: 0,
        matchup: [0, 1, 2, 3, 4].reduce(
            (acc, role) => ({ ...acc, [role]: {} }),
            {},
        ) as ChampionRoleData["matchup"],
        synergy: [0, 1, 2, 3, 4].reduce(
            (acc, role) => ({ ...acc, [role]: {} }),
            {},
        ) as ChampionRoleData["synergy"],
        damageProfile: {
            magic: 0,
            physical: 0,
            true: 0,
        },
        statsByTime: Array.from({ length: 7 }, () => ({
            wins: 0,
            games: 0,
        })),
    };
}

export function deleteChampionRoleDataMatchupSynergyData(
    data: ChampionRoleData,
) {
    data.matchup = {} as ChampionRoleData["matchup"];
    data.synergy = {} as ChampionRoleData["synergy"];
}
