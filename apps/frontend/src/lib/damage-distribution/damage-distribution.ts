import { Role } from "../models/Role";
import { Dataset } from "../models/dataset/Dataset";

export function getTeamDamageDistribution(
    dataset: Dataset,
    team: Map<Role, string>
) {
    const damageDistribution = {
        magic: 0,
        physical: 0,
        true: 0,
    };

    for (const [role, championKey] of team.entries()) {
        const champion = dataset.championData[championKey];
        const championRoleData = champion.statsByRole[role];

        damageDistribution.magic += championRoleData.damageProfile.magic;
        damageDistribution.physical += championRoleData.damageProfile.physical;
        damageDistribution.true += championRoleData.damageProfile.true;
    }

    return damageDistribution;
}
