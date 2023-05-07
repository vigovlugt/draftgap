import { AnalyzeDraftConfig } from "../draft/analysis";
import { Role } from "../models/Role";
import {
    PartialBuildDataset,
    FullBuildDataset,
    BuildMatchupData,
    ItemsBuildData,
} from "../models/build/BuildDataset";
import { EntityAnalysisResult, analyzeEntity } from "./entity-analysis";

export type ItemsAnalysisResult = {
    boots: Record<string, EntityAnalysisResult>;
    statsByOrder: Record<string, EntityAnalysisResult>[];
    startingSets: Record<string, EntityAnalysisResult>;
    sets: Record<string, EntityAnalysisResult>;
};

type ItemType = number | "boots" | "startingSets" | "sets";

export function analyzeItems(
    partialBuildDataset: PartialBuildDataset,
    fullBuildDatset: FullBuildDataset,
    config: AnalyzeDraftConfig
): ItemsAnalysisResult {
    return {
        boots: Object.keys(partialBuildDataset.items.boots).reduce(
            (acc, itemId) => {
                acc[itemId] = analyzeEntity(
                    partialBuildDataset,
                    fullBuildDatset,
                    config,
                    getItemStats,
                    {
                        type: "boots",
                        id: parseInt(itemId),
                    }
                );
                return acc;
            },
            {} as Record<string, EntityAnalysisResult>
        ),
        statsByOrder: partialBuildDataset.items.statsByOrder.map((stats, i) => {
            return Object.keys(stats).reduce((acc, itemId) => {
                acc[itemId] = analyzeEntity(
                    partialBuildDataset,
                    fullBuildDatset,
                    config,
                    getItemStats,
                    {
                        type: i,
                        id: parseInt(itemId),
                    }
                );
                return acc;
            }, {} as Record<string, EntityAnalysisResult>);
        }),
        startingSets: Object.keys(
            partialBuildDataset.items.startingSets
        ).reduce((acc, setId) => {
            acc[setId] = analyzeEntity(
                partialBuildDataset,
                fullBuildDatset,
                config,
                getItemStats,
                {
                    type: "startingSets",
                    id: setId,
                }
            );
            return acc;
        }, {} as Record<string, EntityAnalysisResult>),
        sets: {},
    };
}

function getItemStats(
    data: PartialBuildDataset,
    // order or boots
    item: {
        id: number | string;
        type: ItemType;
    }
) {
    switch (item.type) {
        case "boots":
            return (
                data.items.boots[item.id] ?? {
                    wins: 0,
                    games: 0,
                }
            );
        case "sets":
            return (
                data.items.sets[item.id] ?? {
                    wins: 0,
                    games: 0,
                }
            );
        case "startingSets":
            return (
                data.items.startingSets[item.id] ?? {
                    wins: 0,
                    games: 0,
                }
            );
        default:
            return (
                data.items.statsByOrder[item.type][item.id] ?? {
                    wins: 0,
                    games: 0,
                }
            );
    }
}
