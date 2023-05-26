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
import { ratingToWinrate, winrateToRating } from "../../rating/ratings";

export const DATASET_VERSION = "4";

export interface Dataset {
    version: string;
    date: string;
    championData: Record<string, ChampionData>;

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

    // @ts-ignore
    return {
        version,
        date,
        championData,
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

export function removeRankBias(dataset: Dataset) {
    function getNewWins(wins: number, games: number, rankRating: number) {
        return (
            ratingToWinrate(winrateToRating(wins / games) - rankRating) * games
        );
    }

    const rankWins = Object.values(dataset.championData).reduce(
        (sum, champion) =>
            sum +
            Object.values(champion.statsByRole).reduce(
                (sum, stats) => sum + stats.wins,
                0
            ),
        0
    );
    const rankGames = Object.values(dataset.championData).reduce(
        (sum, champion) =>
            sum +
            Object.values(champion.statsByRole).reduce(
                (sum, stats) => sum + stats.games,
                0
            ),
        0
    );
    const rankWinrate = rankWins / rankGames;
    const rankRating = winrateToRating(rankWinrate);

    for (const championData of Object.values(dataset.championData)) {
        for (const roleData of Object.values(championData.statsByRole)) {
            // Fix base winrate
            roleData.wins = getNewWins(
                roleData.wins,
                roleData.games,
                rankRating
            );

            // Fix matchups
            for (const matchupData of Object.values(roleData.matchup)) {
                for (const matchupRoleData of Object.values(matchupData)) {
                    matchupRoleData.wins = getNewWins(
                        matchupRoleData.wins,
                        matchupRoleData.games,
                        rankRating
                    );
                }
            }

            // Fix duos
            for (const duoData of Object.values(roleData.synergy)) {
                for (const duoRoleData of Object.values(duoData)) {
                    duoRoleData.wins = getNewWins(
                        duoRoleData.wins,
                        duoRoleData.games,
                        rankRating
                    );
                }
            }
        }
    }
}
