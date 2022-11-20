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
    createObjectDeserializer,
    SerializationContext,
    serializeObject,
    serializeVarUint,
    deserializeObject,
    deserializeVarUint,
} from "../serialization/serialization";

export interface Dataset {
    version: string;
    championData: Record<string, ChampionData>;
}

export function serializeDataset(ctx: SerializationContext, dataset: Dataset) {
    serializeString(ctx, dataset.version);
    serializeObject(
        ctx,
        (ctx, value) => serializeVarUint(ctx, Number(value)),
        serializeChampionData,
        dataset.championData
    );
}

export function deserializeDataset(ctx: SerializationContext): Dataset {
    const version = deserializeString(ctx);
    const championData = deserializeObject(
        ctx,
        (ctx) => deserializeVarUint(ctx),
        deserializeChampionData
    );

    return {
        version,
        championData,
    };
}

export function getSerializedDataset(dataset: Dataset) {
    return serialize(serializeDataset, dataset);
}

export function getDeserializedDataset(serializedDataset: ArrayBuffer) {
    return deserialize(deserializeDataset, serializedDataset);
}
