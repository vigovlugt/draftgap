import { Role } from "../Role";

export type PatchChangeType = "buff" | "nerf" | "adjusted";

export type ChampionPatchChange = {
    // Patch the champion was changed in, ex. 16.22
    patch: string;
    type: PatchChangeType;
    // Winrate in the patch and its change versus the previous patch, in percentage points
    // The main role of the champion comes first
    roleStats: { role: Role; winrate: number; delta: number }[];
};
