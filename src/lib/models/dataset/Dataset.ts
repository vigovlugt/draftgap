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
} from "../../serialization/serialization";
import { deserializeRankData, RankData, serializeRankData } from "./RankData";
import { deleteChampionRoleDataMatchupSynergyData } from "./ChampionRoleData";
import { RuneData, RunePathData, StatShardData } from "./RuneData";
import { ItemData } from "./ItemData";

export interface Dataset {
    version: string;
    date: string;
    championData: Record<string, ChampionData>;
    rankData: RankData;

    itemData: Record<number, ItemData>;
    runeData: Record<number, RuneData>;
    runePathData: Record<number, RunePathData>;
    statShardData: Record<number, StatShardData>;
}

export function serializeDataset(ctx: SerializationContext, dataset: Dataset) {
    throw new Error("Not implemented");
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
    throw new Error("Not implemented");
    const version = deserializeString(ctx);
    const date = deserializeString(ctx);
    const championData = deserializeObject(
        ctx,
        (ctx) => deserializeVarUint(ctx),
        deserializeChampionData
    );
    const rankData = deserializeRankData(ctx);

    // @ts-ignore
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

export function deleteDatasetMatchupSynergyData(dataset: Dataset) {
    for (const champion of Object.values(dataset.championData)) {
        for (const role of Object.values(champion.statsByRole)) {
            deleteChampionRoleDataMatchupSynergyData(role);
        }
    }
}
