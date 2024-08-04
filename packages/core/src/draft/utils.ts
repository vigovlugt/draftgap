import { Dataset } from "../models/dataset/Dataset";
import { Role } from "../models/Role";

export function getStats(
    dataset: Dataset,
    championKey: string,
    role: Role
): { wins: number; games: number };
export function getStats(
    dataset: Dataset,
    championKey: string,
    role: Role,
    type: "duo",
    role2: Role,
    championKey2: string
): { wins: number; games: number };
export function getStats(
    dataset: Dataset,
    championKey: string,
    role: Role,
    type: "matchup",
    role2: Role,
    championKey2: string
): { wins: number; games: number };
export function getStats(
    dataset: Dataset,
    championKey: string,
    role: Role,
    type?: "matchup" | "duo",
    matchupDuoRole?: Role,
    matchupDuoChampionKey?: string
) {
    if (!type) {
        return (
            dataset.championData[championKey]?.statsByRole[role] ?? {
                wins: 0,
                games: 0,
            }
        );
    }

    if (type === "matchup") {
        matchupDuoRole = matchupDuoRole!;
        matchupDuoChampionKey = matchupDuoChampionKey!;
        return (
            dataset.championData[championKey].statsByRole[role]?.matchup[
                matchupDuoRole
            ][matchupDuoChampionKey] ?? {
                wins: 0,
                games: 0,
            }
        );
    } else {
        matchupDuoRole = matchupDuoRole!;
        matchupDuoChampionKey = matchupDuoChampionKey!;

        return (
            dataset.championData[championKey].statsByRole[role].synergy[
                matchupDuoRole
            ][matchupDuoChampionKey] ?? {
                wins: 0,
                games: 0,
            }
        );
    }
}
