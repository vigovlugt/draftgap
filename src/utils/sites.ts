import { Role } from "../lib/models/Role";
import { StatsSite } from "../contexts/DraftContext";
import { LOLALYTICS_ROLES } from "../lib/data/lolalytics/roles";

const UGG_ROLES = ["top", "jungle", "mid", "adc", "support"] as const;
const OP_GG_ROLES = ["top", "jungle", "mid", "adc", "support"] as const;

export const linkByStatsSite = (
    statsSite: StatsSite,
    champion: string,
    role: Role
) => {
    switch (statsSite) {
        case "lolalytics":
            return `https://lolalytics.com/lol/${champion}/build/?lane=${LOLALYTICS_ROLES[role]}`;
        case "u.gg":
            return `https://u.gg/lol/champions/${champion}/build/${UGG_ROLES[role]}`;
        case "op.gg":
            return `https://op.gg/champions/${champion}/${OP_GG_ROLES[role]}/build`;
    }
};
