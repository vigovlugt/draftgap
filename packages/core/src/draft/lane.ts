import { Role } from "../models/Role";
import { DraftResult } from "./analysis";

// The enemy roles a role plays against in lane
export const LANE_OPPONENT_ROLES: Record<Role, Role[]> = {
    [Role.Top]: [Role.Top],
    [Role.Jungle]: [Role.Jungle],
    [Role.Middle]: [Role.Middle],
    [Role.Bottom]: [Role.Bottom, Role.Support],
    [Role.Support]: [Role.Bottom, Role.Support],
};

// Total matchup rating of a champion against its lane opponents, undefined when none of them are picked yet
export function getLaneMatchupRating(
    draftResult: DraftResult,
    role: Role,
    championKey: string,
) {
    const laneMatchups = draftResult.matchupRating.matchupResults.filter(
        (result) =>
            result.roleA === role &&
            result.championKeyA === championKey &&
            LANE_OPPONENT_ROLES[role].includes(result.roleB),
    );
    if (laneMatchups.length === 0) return undefined;

    return laneMatchups.reduce((sum, result) => sum + result.rating, 0);
}
