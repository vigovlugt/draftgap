import {
    SerializationContext,
    serializeVarUint,
    serializeObject,
    DeserializationContext,
    deserializeVarUint,
    deserializeObject,
} from "../serialization/serialization";
import {
    ChampionDamageProfile,
    deserializeChampionDamageProfile,
    serializeChampionDamageProfile,
} from "./ChampionDamageProfile";
import {
    ChampionMatchupData,
    deserializeChampionMatchupData,
    serializeChampionMatchupData,
} from "./ChampionMatchupData";
import {
    ChampionSynergyData,
    deserializeChampionSynergyData,
    serializeChampionSynergyData,
} from "./ChampionSynergyData";
import { Role } from "./Role";

export interface ChampionRoleData {
    games: number;
    wins: number;
    matchup: Record<Role, Record<string, ChampionMatchupData>>;
    synergy: Record<Role, Record<string, ChampionSynergyData>>;
    damageProfile: ChampionDamageProfile;
}

export function serializeChampionRoleData(
    ctx: SerializationContext,
    championRoleData: ChampionRoleData
) {
    serializeVarUint(ctx, championRoleData.games);
    serializeVarUint(ctx, championRoleData.wins);
    serializeObject(
        ctx,
        (ctx, value) => serializeVarUint(ctx, Number(value)),
        (ctx, value) => {
            return serializeObject(
                ctx,
                (ctx, value) => serializeVarUint(ctx, Number(value)),
                serializeChampionMatchupData,
                value
            );
        },
        championRoleData.matchup
    );
    serializeObject(
        ctx,
        (ctx, value) => serializeVarUint(ctx, Number(value)),
        (ctx, value) => {
            return serializeObject(
                ctx,
                (ctx, value) => serializeVarUint(ctx, Number(value)),
                serializeChampionSynergyData,
                value
            );
        },
        championRoleData.synergy
    );
    serializeChampionDamageProfile(ctx, championRoleData.damageProfile);
}

export function deserializeChampionRoleData(
    ctx: DeserializationContext
): ChampionRoleData {
    const games = deserializeVarUint(ctx);
    const wins = deserializeVarUint(ctx);

    const matchup = deserializeObject(
        ctx,
        (ctx) => deserializeVarUint(ctx) as Role,
        (ctx) => {
            return deserializeObject(
                ctx,
                (ctx) => deserializeVarUint(ctx),
                deserializeChampionMatchupData
            );
        }
    );

    const synergy = deserializeObject(
        ctx,
        (ctx) => deserializeVarUint(ctx) as Role,
        (ctx) => {
            return deserializeObject(
                ctx,
                (ctx) => deserializeVarUint(ctx),
                deserializeChampionSynergyData
            );
        }
    );

    const damageProfile = deserializeChampionDamageProfile(ctx);

    return {
        games,
        wins,
        matchup,
        synergy,
        damageProfile,
    };
}

export function deleteChampionRoleDataMatchupSynergyData(
    data: ChampionRoleData
) {
    data.matchup = {} as ChampionRoleData["matchup"];
    data.synergy = {} as ChampionRoleData["synergy"];
}
