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
