import { RiskLevel } from "../../risk/risk-level";
import { EloBracket } from "../rank/elo-bracket";

export type StatsSite = "op.gg" | "u.gg" | "lolalytics";

export const DraftTablePlacement = {
    Bottom: "bottom",
    Hidden: "hidden",
    InPlace: "in-place",
} as const;
type DraftTablePlacement =
    (typeof DraftTablePlacement)[keyof typeof DraftTablePlacement];

export type DraftGapConfig = {
    // DRAFT ANALYSIS
    ignoreChampionWinrates: boolean;
    riskLevel: RiskLevel;
    minGames: number;
    eloBracket: EloBracket;
    usePickBanRateAdjustments: boolean;
    banRateRatingBonus: number;
    pickRatePriorScale: number;
    referencePickRate: number;

    // DRAFT SUGGESTIONS
    showFavouritesAtTop: boolean;
    banPlacement: DraftTablePlacement;
    unownedPlacement: DraftTablePlacement;
    showAdvancedWinrates: boolean;
    language: string;

    // MISC
    defaultStatsSite: StatsSite;
    enableBetaFeatures: boolean;

    // LOL CLIENT
    disableLeagueClientIntegration: boolean;
};
