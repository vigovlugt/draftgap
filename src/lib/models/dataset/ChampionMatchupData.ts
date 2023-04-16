import {
    SerializationContext,
    serializeString,
    DeserializationContext,
    deserializeString,
    serializeVarUint,
    deserializeVarUint,
} from "../../serialization/serialization";

export interface ChampionMatchupData {
    championKey: string;
    games: number;
    wins: number;
}

export function serializeChampionMatchupData(
    ctx: SerializationContext,
    championMatchupData: ChampionMatchupData
) {
    serializeVarUint(ctx, Number(championMatchupData.championKey));
    serializeVarUint(ctx, championMatchupData.games);
    serializeVarUint(ctx, championMatchupData.wins);
}

export function deserializeChampionMatchupData(
    ctx: DeserializationContext
): ChampionMatchupData {
    const championKey = deserializeVarUint(ctx).toString();
    const games = deserializeVarUint(ctx);
    const wins = deserializeVarUint(ctx);

    return {
        championKey,
        games,
        wins,
    };
}
