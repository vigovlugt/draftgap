import { AnalyzeDraftConfig } from "../draft/analysis";
import {
    PartialBuildDataset,
    FullBuildDataset,
    Skill,
    SkillOrder,
} from "../models/build/BuildDataset";
import { EntityAnalysisResult, analyzeEntity } from "./entity-analysis";

export type SkillsAnalysisResult = {
    order: Record<SkillOrder, EntityAnalysisResult>;
    levels: Record<Skill, EntityAnalysisResult>[];
};

export function analyzeSkills(
    partialBuildDataset: PartialBuildDataset,
    fullBuildDataset: FullBuildDataset,
    config: AnalyzeDraftConfig,
): SkillsAnalysisResult {
    const skills = {
        levels: [] as Record<Skill, EntityAnalysisResult>[],
        order: {},
    } as SkillsAnalysisResult;

    for (const skill of Object.keys(
        partialBuildDataset.skills.order,
    ) as SkillOrder[]) {
        skills.order[skill] = analyzeEntity(
            partialBuildDataset,
            fullBuildDataset,
            config,
            getSkillOrderStats,
            skill,
        );
    }

    for (let i = 0; i < partialBuildDataset.skills.level.length; i++) {
        skills.levels.push({} as Record<Skill, EntityAnalysisResult>);
        for (const skill of Object.keys(
            partialBuildDataset.skills.level[i],
        ) as Skill[]) {
            skills.levels[i][skill] = analyzeEntity(
                partialBuildDataset,
                fullBuildDataset,
                config,
                getSkillLevelStats,
                {
                    level: i,
                    skill,
                },
            );
        }
    }

    return skills;
}

function getSkillLevelStats(
    data: PartialBuildDataset,
    skill: {
        level: number;
        skill: Skill;
    },
) {
    return data.skills.level[skill.level][skill.skill] ?? { wins: 0, games: 0 };
}

function getSkillOrderStats(data: PartialBuildDataset, skillOrder: SkillOrder) {
    return data.skills.order[skillOrder] ?? { wins: 0, games: 0 };
}
