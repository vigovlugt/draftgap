import { ratingToWinrate } from "../lib/rating/ratings";

export function formatRating(rating: number): string {
    return formatPercentage(ratingToWinrate(rating));
}

export function formatPercentage(
    percentage: number,
    maxDecimals = 2,
    useMinDecimals = false
): string {
    const p = (percentage * 100).toFixed(maxDecimals).toString();

    if (useMinDecimals) {
        return parseFloat(p).toString();
    }

    return p;
}

export function getRatingClass(rating: number, noOkay = false) {
    const winrate = ratingToWinrate(rating);

    if (winrate < 0.45) {
        return "text-winrate-shiggo";
    } else if (winrate < (noOkay ? 0.5 : 0.485)) {
        return "text-winrate-meh";
    } else if (winrate < 0.515 && !noOkay) {
        return "text-winrate-okay dark:text-winrate-okay-dark";
    } else if (winrate < 0.53) {
        return "text-winrate-good";
    } else if (winrate < 0.55) {
        return "text-winrate-great";
    }

    return "text-winrate-volxd";
}
