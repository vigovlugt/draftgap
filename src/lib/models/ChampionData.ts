import {
    serializeString,
    serializeObject,
    deserializeString,
    deserializeObject,
    DeserializationContext,
    SerializationContext,
    serializeVarUint,
    deserializeVarUint,
} from "../serialization/serialization";
import {
    ChampionRoleData,
    deserializeChampionRoleData,
    serializeChampionRoleData,
} from "./ChampionRoleData";
import { Role } from "./Role";

export interface ChampionData {
    id: string;
    key: string;
    name: string;
    statsByRole: Record<Role, ChampionRoleData>;
}

export function serializeChampionData(
    ctx: SerializationContext,
    championData: ChampionData
) {
    serializeString(ctx, championData.id);
    serializeVarUint(ctx, Number(championData.key));
    serializeString(ctx, championData.name);
    serializeObject(
        ctx,
        (ctx, value) => serializeVarUint(ctx, Number(value)),
        serializeChampionRoleData,
        championData.statsByRole
    );
}

export function deserializeChampionData(
    ctx: DeserializationContext
): ChampionData {
    const id = deserializeString(ctx);
    const key = deserializeVarUint(ctx).toString();
    const name = deserializeString(ctx);
    const statsByRole = deserializeObject(
        ctx,
        (ctx) => deserializeVarUint(ctx) as Role,
        deserializeChampionRoleData
    );

    return {
        id,
        key,
        name,
        statsByRole,
    };
}
