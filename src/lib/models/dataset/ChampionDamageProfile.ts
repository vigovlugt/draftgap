import {
    SerializationContext,
    DeserializationContext,
    serializeVarUint,
    deserializeVarUint,
} from "../../serialization/serialization";

export interface ChampionDamageProfile {
    magic: number;
    physical: number;
    true: number;
}

export function serializeChampionDamageProfile(
    ctx: SerializationContext,
    damageProfile: ChampionDamageProfile
) {
    serializeVarUint(ctx, damageProfile.physical);
    serializeVarUint(ctx, damageProfile.magic);
    serializeVarUint(ctx, damageProfile.true);
}

export function deserializeChampionDamageProfile(
    ctx: DeserializationContext
): ChampionDamageProfile {
    const physical = deserializeVarUint(ctx);
    const magic = deserializeVarUint(ctx);
    const trueDmg = deserializeVarUint(ctx);

    return {
        physical,
        magic,
        true: trueDmg,
    };
}
