import { ChampionRoleData } from "./ChampionRoleData";
import { Role } from "../Role";

export interface ChampionData {
    id: string;
    key: string;
    name: string;
    i18n: Record<
        string,
        {
            name: string;
        }
    >;
    statsByRole: Record<Role, ChampionRoleData>;
}
