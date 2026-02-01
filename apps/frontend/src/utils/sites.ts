import { Role } from "@draftgap/core/src/models/Role";
import { StatsSite } from "@draftgap/core/src/models/user/Config";

const UGG_ROLES = ["top", "jungle", "mid", "adc", "support"] as const;
const OP_GG_ROLES = ["top", "jungle", "mid", "adc", "support"] as const;
const LOLALYTICS_ROLES = [
    "top",
    "jungle",
    "middle",
    "bottom",
    "support",
] as const;

export const linkByStatsSite = (
    statsSite: StatsSite,
    champion: string,
    role: Role,
) => {
    champion = champion.toLowerCase();
    if (champion === "monkeyking") champion = "wukong";

    switch (statsSite) {
        case "lolalytics":
            return `https://lolalytics.com/lol/${champion}/build/?lane=${LOLALYTICS_ROLES[role]}`;
        case "u.gg":
            return `https://u.gg/lol/champions/${champion}/build/${UGG_ROLES[role]}`;
        case "op.gg":
            return `https://op.gg/champions/${champion}/${OP_GG_ROLES[role]}/build`;
    }
};

export const displayNameByStatsSite = (statsSite: StatsSite) => {
    switch (statsSite) {
        case "lolalytics":
            return "LoLalytics";
        case "u.gg":
            return "U.GG";
        case "op.gg":
            return "OP.GG";
    }
};
