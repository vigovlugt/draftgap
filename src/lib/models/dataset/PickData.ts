import { ChampionData } from "./ChampionData";
import { Role } from "../Role";

export interface PickData extends ChampionData {
    probabilityByRole: Map<Role, number>;
}
