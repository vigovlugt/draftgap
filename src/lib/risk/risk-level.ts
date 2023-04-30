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
    "very-low": 2500,
    low: 1000,
    medium: 500,
    high: 250,
    "very-high": 100,
};
