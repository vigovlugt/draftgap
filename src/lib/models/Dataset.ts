import {
    ChampionData,
    serializeChampionData,
    deserializeChampionData,
} from "./ChampionData";
import {
    serialize,
    deserialize,
    serializeString,
    deserializeString,
    SerializationContext,
    serializeObject,
    serializeVarUint,
    deserializeObject,
    deserializeVarUint,
} from "../serialization/serialization";
import { deserializeRankData, RankData, serializeRankData } from "./RankData";

export interface Dataset {
    version: string;
    date: string;
    championData: Record<string, ChampionData>;
    rankData: RankData;
}

export function serializeDataset(ctx: SerializationContext, dataset: Dataset) {
    serializeString(ctx, dataset.version);
    serializeString(ctx, dataset.date);
    serializeObject(
        ctx,
        (ctx, value) => serializeVarUint(ctx, Number(value)),
        serializeChampionData,
        dataset.championData
    );
    serializeRankData(ctx, dataset.rankData);
}

export function deserializeDataset(ctx: SerializationContext): Dataset {
    const version = deserializeString(ctx);
    const date = deserializeString(ctx);
    const championData = deserializeObject(
        ctx,
        (ctx) => deserializeVarUint(ctx),
        deserializeChampionData
    );
    const rankData = deserializeRankData(ctx);

    return {
        version,
        date,
        championData,
        rankData,
    };
}

export function getSerializedDataset(dataset: Dataset) {
    return serialize(serializeDataset, dataset);
}

export function getDeserializedDataset(serializedDataset: ArrayBuffer) {
    return deserialize(deserializeDataset, serializedDataset);
}
