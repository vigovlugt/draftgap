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
    "very-low": 1000,
    low: 500,
    medium: 250,
    high: 100,
    "very-high": 50,
};
