import {
    SerializationContext,
    serializeVarUint,
    DeserializationContext,
    deserializeVarUint,
} from "../serialization/serialization";

export interface ChampionSynergyData {
    championKey: string;
    games: number;
    wins: number;
}

export function serializeChampionSynergyData(
    ctx: SerializationContext,
    championSynergyData: ChampionSynergyData
) {
    serializeVarUint(ctx, Number(championSynergyData.championKey));
    serializeVarUint(ctx, championSynergyData.games);
    serializeVarUint(ctx, championSynergyData.wins);
}

export function deserializeChampionSynergyData(
    ctx: DeserializationContext
): ChampionSynergyData {
    const championKey = deserializeVarUint(ctx).toString();
    const games = deserializeVarUint(ctx);
    const wins = deserializeVarUint(ctx);

    return {
        championKey,
        games,
        wins,
    };
}
