import { AnalyzeDraftConfig } from "../draft/analysis";
import {
    PartialBuildDataset,
    FullBuildDataset,
} from "../models/build/BuildDataset";
import { EntityAnalysisResult, analyzeEntity } from "./entity-analysis";

export type SummonerSpellsAnalysisResult = Record<string, EntityAnalysisResult>;

export function analyzeSummonerSpells(
    partialBuildDataset: PartialBuildDataset,
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig
): SummonerSpellsAnalysisResult {
    const summonerSpells = {} as Record<string, EntityAnalysisResult>;

    for (const spellSetId of Object.keys(partialBuildDataset.summonerSpells)) {
        summonerSpells[spellSetId] = analyzeEntity(
            partialBuildDataset,
            fullBuildDataset,
            config,
            getSummonerSpellStats,
            spellSetId
        );
    }

    return summonerSpells;
}

function getSummonerSpellStats(data: PartialBuildDataset, id: string) {
    return data.summonerSpells[id] ?? { wins: 0, games: 0 };
}
