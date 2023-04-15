import { Role } from "../lib/models/Role";
import { StatsSite } from "../context/DraftContext";
import { LOLALYTICS_ROLES } from "../lib/data/lolalytics/roles";

export const linkByStatsSite = (
    statsSite: StatsSite,
    champion: string,
    role: Role
) => {
    switch (statsSite) {
        case "lolalytics":
            return `https://lolalytics.com/lol/${champion}/build/?lane=${LOLALYTICS_ROLES[role]}`;
        case "u.gg":
            return `https://u.gg/lol/champions/${champion}/build?role=${LOLALYTICS_ROLES[role]}`;
        case "op.gg":
            return `https://op.gg/champions/${champion}/${LOLALYTICS_ROLES[role]}/build`;
    }
};
