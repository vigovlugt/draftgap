import { ChampionDamageProfile } from "../models/ChampionDamageProfile";
import { ChampionData } from "../models/ChampionData";
import { ChampionMatchupData } from "../models/ChampionMatchupData";
import { ChampionRoleData } from "../models/ChampionRoleData";
import { ChampionSynergyData } from "../models/ChampionSynergyData";
import { Dataset } from "../models/Dataset";
import { Role } from "../models/Role";

export function combineDatasets(
    datasets: Dataset[],
    weights: number[]
): Dataset {
    const lastDataset = datasets[datasets.length - 1];
    const version = lastDataset.version;

    const championData: Record<string, ChampionData> = {};
    for (const championKey of Object.keys(lastDataset.championData)) {
        const combinedChampionData = combineChampionData(
            datasets.map((dataset) => dataset.championData[championKey]),
            weights
        );

        championData[championKey] = combinedChampionData;
    }

    return {
        version,
        championData,
    };
}

function combineChampionData(
    championData: ChampionData[],
    weights: number[]
): ChampionData {
    const lastChampionData = championData[championData.length - 1];

    const statsByRole: Record<Role, ChampionRoleData> = {} as any;
    for (const key of Object.keys(lastChampionData.statsByRole)) {
        const role = Number(key) as Role;
        const combinedChampionRoleData = combineChampionRoleData(
            championData.map((championData) => championData.statsByRole[role]),
            weights
        );

        statsByRole[role] = combinedChampionRoleData;
    }

    return {
        ...lastChampionData,
        statsByRole,
    };
}

function combineChampionRoleData(
    championRoleData: ChampionRoleData[],
    weights: number[]
): ChampionRoleData {
    const games = combineNumbers(
        championRoleData.map((championRoleData) => championRoleData.games),
        weights
    );
    const wins = combineNumbers(
        championRoleData.map((championRoleData) => championRoleData.wins),
        weights
    );

    const damageProfile = combineDamageProfiles(
        championRoleData.map(
            (championRoleData) => championRoleData.damageProfile
        ),
        weights
    );

    const matchup = combineMatchupSynergyData(
        championRoleData.map((championRoleData) => championRoleData.matchup),
        weights
    );

    const synergy = combineMatchupSynergyData(
        championRoleData.map((championRoleData) => championRoleData.synergy),
        weights
    );

    return {
        games,
        wins,
        damageProfile,
        matchup,
        synergy,
    };
}

type ChampionMatchupSynergy = ChampionMatchupData & ChampionSynergyData;

function combineMatchupSynergyData<T extends ChampionMatchupSynergy>(
    matchupDatas: Record<Role, Record<string, T>>[],
    weights: number[]
) {
    const combined: Record<Role, Record<string, T>> = {} as any;

    for (const [matchupData, weight] of matchupDatas.map<
        [Record<Role, Record<string, T>>, number]
    >((d, i) => [d, weights[i]])) {
        for (const [roleStr, matchupByChampion] of Object.entries(
            matchupData
        )) {
            const role = Number(roleStr) as Role;
            for (const [championKey, matchup] of Object.entries(
                matchupByChampion
            )) {
                if (matchupData[role] === undefined) {
                    matchupData[role] = {};
                }
                if (matchupData[role][championKey] === undefined) {
                    const obj: T = {
                        championKey,
                        games: 0,
                        wins: 0,
                    } as any;
                    matchupData[role][championKey] = obj;
                }

                matchupData[role][championKey].games += matchup.games * weight;
                matchupData[role][championKey].wins += matchup.wins * weight;
            }
        }
    }

    return combined;
}

function combineDamageProfiles(
    damageProfiles: ChampionDamageProfile[],
    weights: number[]
) {
    const damageProfile: ChampionDamageProfile = {
        physical: combineNumbers(
            damageProfiles.map((d) => d.physical),
            weights
        ),
        magic: combineNumbers(
            damageProfiles.map((d) => d.magic),
            weights
        ),
        true: combineNumbers(
            damageProfiles.map((d) => d.true),
            weights
        ),
    };

    return damageProfile;
}

function combineNumbers(numbers: number[], weights: number[]) {
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i] * weights[i];
    }

    return sum;
}
