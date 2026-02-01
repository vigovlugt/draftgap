import { ChampionData } from "./ChampionData";
import { deleteChampionRoleDataMatchupSynergyData } from "./ChampionRoleData";
import { RuneData, RunePathData, StatShardData } from "./RuneData";
import { ItemData } from "./ItemData";
import { ratingToWinrate, winrateToRating } from "../../rating/ratings";
import { SummonerSpellData } from "./SummonerSpellData";

export const DATASET_VERSION = "5";

export interface Dataset {
    version: string;
    date: string;
    championData: Record<string, ChampionData>;

    itemData: Record<number, ItemData>;
    runeData: Record<number, RuneData>;
    runePathData: Record<number, RunePathData>;
    statShardData: Record<number, StatShardData>;
    summonerSpellData: Record<number, SummonerSpellData>;
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
                0,
            ),
        0,
    );
    const rankGames = Object.values(dataset.championData).reduce(
        (sum, champion) =>
            sum +
            Object.values(champion.statsByRole).reduce(
                (sum, stats) => sum + stats.games,
                0,
            ),
        0,
    );
    const rankWinrate = rankWins / rankGames;
    const rankRating = winrateToRating(rankWinrate);

    for (const championData of Object.values(dataset.championData)) {
        for (const roleData of Object.values(championData.statsByRole)) {
            // Fix base winrate
            roleData.wins = getNewWins(
                roleData.wins,
                roleData.games,
                rankRating,
            );

            // Fix matchups
            for (const matchupData of Object.values(roleData.matchup)) {
                for (const matchupRoleData of Object.values(matchupData)) {
                    matchupRoleData.wins = getNewWins(
                        matchupRoleData.wins,
                        matchupRoleData.games,
                        rankRating,
                    );
                }
            }

            // Fix duos
            for (const duoData of Object.values(roleData.synergy)) {
                for (const duoRoleData of Object.values(duoData)) {
                    duoRoleData.wins = getNewWins(
                        duoRoleData.wins,
                        duoRoleData.games,
                        rankRating,
                    );
                }
            }

            // Fix time stats
            for (const timeStats of Object.values(roleData.statsByTime)) {
                timeStats.wins = getNewWins(
                    timeStats.wins,
                    timeStats.games,
                    rankRating,
                );
            }
        }
    }
}
