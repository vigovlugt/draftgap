import { ChampionData } from "../models/ChampionData";
import { Role } from "../models/Role";

export function getTeamDamageDistribution(
    dataset: Record<string, ChampionData>,
    team: Map<Role, string>
) {
    const damageDistribution = {
        magic: 0,
        physical: 0,
        true: 0,
    };

    for (const [role, championKey] of team.entries()) {
        const champion = dataset[championKey];
        const championRoleData = champion.statsByRole[role];

        damageDistribution.magic += championRoleData.damageProfile.magic;
        damageDistribution.physical += championRoleData.damageProfile.physical;
        damageDistribution.true += championRoleData.damageProfile.true;
    }

    return damageDistribution;
}
