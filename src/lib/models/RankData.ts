import {
    deserializeVarUint,
    Serializer,
    Deserializer,
    serializeVarUint,
} from "../serialization/serialization";

export interface RankData {
    wins: number;
    games: number;
}

export const serializeRankData: Serializer<RankData> = (ctx, rankData) => {
    serializeVarUint(ctx, rankData.wins);
    serializeVarUint(ctx, rankData.games);
};

export const deserializeRankData: Deserializer<RankData> = (ctx) => {
    const wins = deserializeVarUint(ctx);
    const games = deserializeVarUint(ctx);

    return {
        wins,
        games,
    };
};
