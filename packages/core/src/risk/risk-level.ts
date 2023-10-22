export const RiskLevel = [
    "very-low",
    "low",
    "medium",
    "high",
    "very-high",
] as const;

export type RiskLevel = (typeof RiskLevel)[number];

export const displayNameByRiskLevel: Record<RiskLevel, string> = {
    "very-low": "Very Low",
    low: "Low",
    medium: "Medium",
    high: "High",
    "very-high": "Very High",
};

export const priorGamesByRiskLevel: Record<RiskLevel, number> = {
    "very-low": 3000,
    low: 2000,
    medium: 1000,
    high: 500,
    "very-high": 250,
};

export const buildPriorGamesByRiskLevel: Record<RiskLevel, number> = {
    "very-low": 3000,
    low: 2000,
    medium: 1000,
    high: 750,
    "very-high": 500,
};
