import {
    SerializationContext,
    serializeVarUint,
    serializeObject,
    serializeString,
    DeserializationContext,
    deserializeVarUint,
    deserializeObject,
    deserializeString,
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
        serializeString,
        (ctx, value) => {
            return serializeObject(
                ctx,
                serializeString,
                serializeChampionMatchupData,
                value
            );
        },
        championRoleData.matchup
    );
    serializeObject(
        ctx,
        serializeString,
        (ctx, value) => {
            return serializeObject(
                ctx,
                serializeString,
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

    const matchup = deserializeObject(ctx, deserializeString, (ctx) => {
        return deserializeObject(
            ctx,
            deserializeString,
            deserializeChampionMatchupData
        );
    });

    const synergy = deserializeObject(ctx, deserializeString, (ctx) => {
        return deserializeObject(
            ctx,
            deserializeString,
            deserializeChampionSynergyData
        );
    });

    const damageProfile = deserializeChampionDamageProfile(ctx);

    return {
        games,
        wins,
        matchup,
        synergy,
        damageProfile,
    };
}
