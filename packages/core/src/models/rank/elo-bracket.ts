export const EloBracket = ["platinum", "emerald_plus", "diamond_plus"] as const;
export type EloBracket = (typeof EloBracket)[number];

export const displayNameByEloBracket: Record<EloBracket, string> = {
    platinum: "Platinum",
    emerald_plus: "Emerald+",
    diamond_plus: "Diamond+",
};

export const DEFAULT_ELO_BRACKET: EloBracket = "emerald_plus";
