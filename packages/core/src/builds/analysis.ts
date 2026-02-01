import { AnalyzeDraftConfig } from "../draft/analysis";
import {
    FullBuildDataset,
    PartialBuildDataset,
} from "../models/build/BuildDataset";
import { Dataset } from "../models/dataset/Dataset";
import { ItemsAnalysisResult, analyzeItems } from "./item-analysis";
import {
    RunesAnalysisResult as RunesAnalysisResult,
    analyzeRunes,
} from "./rune-analysis";
import { SkillsAnalysisResult, analyzeSkills } from "./skill-analysis";
import {
    SummonerSpellsAnalysisResult,
    analyzeSummonerSpells,
} from "./summoner-spell-analysis";

export type BuildAnalysisResult = {
    runes: RunesAnalysisResult;
    items: ItemsAnalysisResult;
    summonerSpells: SummonerSpellsAnalysisResult;
    skills: SkillsAnalysisResult;
};

export function analyzeBuild(
    dataset: Dataset,
    fullDataset: Dataset,
    partialBuildDataset: PartialBuildDataset,
    fullBuildDatset: FullBuildDataset,
    config: AnalyzeDraftConfig,
) {
    return {
        runes: analyzeRunes(partialBuildDataset, fullBuildDatset, config),
        items: analyzeItems(partialBuildDataset, fullBuildDatset, config),
        summonerSpells: analyzeSummonerSpells(
            partialBuildDataset,
            fullBuildDatset,
            config,
        ),
        skills: analyzeSkills(partialBuildDataset, fullBuildDatset, config),
    };
}
