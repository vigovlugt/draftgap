import { Dataset } from "../models/dataset/Dataset";
import { Role } from "../models/Role";
import { winrateToRating } from "../rating/ratings";
import { priorGamesByRiskLevel } from "../risk/risk-level";
import { addStats } from "../stats";
import { AnalyzeDraftConfig } from "./analysis";

export function analyzeDraftExtra(
    dataset: Dataset,
    fullDataset: Dataset,
    team: Map<Role, string>,
    enemy: Map<Role, string>,
    config: AnalyzeDraftConfig
) {
    const priorGames = priorGamesByRiskLevel[config.riskLevel];

    const ally = [...team.entries()];
    const teamChampions = ally.map(
        ([role, champion]) =>
            fullDataset.championData[champion].statsByRole[role]
    );

    return {
        ratingByTime: Array.from({ length: 5 }).map((_, i) => {
            const championTimeRatings = teamChampions.map((champion) => {
                const championTime = champion.statsByTime[i];

                const baseChampionStats = addStats(champion, {
                    games: priorGames,
                    wins: priorGames * 0.5,
                });
                const baseChampionWinrate =
                    baseChampionStats.wins / baseChampionStats.games;
                const baseChampionRating = winrateToRating(baseChampionWinrate);

                const championStats = addStats(championTime, {
                    games: priorGames,
                    wins: priorGames * baseChampionWinrate,
                });
                const championTimeRating = winrateToRating(
                    championStats.wins / championStats.games
                );

                return championTimeRating - baseChampionRating;
            });

            const totalRating = championTimeRatings.reduce(
                (acc, rating) => acc + rating,
                0
            );

            return {
                championResults: championTimeRatings.map((rating, i) => ({
                    championKey: ally[i][1],
                    role: ally[i][0],
                    rating,
                })),
                totalRating,
            };
        }),
    };
}

export type DraftExtraAnalysis = ReturnType<typeof analyzeDraftExtra>;
