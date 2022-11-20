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
    createObjectSerializer,
} from "../serialization/serialization";

export type Dataset = Record<string, ChampionData>;

export function serializeDataset(dataset: Dataset) {
    return serialize(
        createObjectSerializer(serializeString, serializeChampionData),
        dataset
    );
}

export function deserializeDataset(serializedDataset: ArrayBuffer) {
    return deserialize(
        createObjectDeserializer(deserializeString, deserializeChampionData),
        serializedDataset
    );
}
