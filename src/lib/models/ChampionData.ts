import { Role } from "./Role";

export interface ChampionData {
    id: string;
    key: string;
    name: string;
    statsByRole: Record<Role, ChampionRoleData>;
}

export interface ChampionRoleData {
    games: number;
    wins: number;
    matchup: Record<Role, Record<string, ChampionMatchupData>>;
    synergy: Record<Role, Record<string, ChampionSynergyData>>;
    damageProfile: ChampionDamageData;
}

export interface ChampionMatchupData {
    championKey: string;
    games: number;
    wins: number;
}

export interface ChampionSynergyData {
    championKey: string;
    games: number;
    wins: number;
}

export interface ChampionDamageData {
    magic: number;
    physical: number;
    true: number;
}
