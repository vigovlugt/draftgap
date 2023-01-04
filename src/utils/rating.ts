import { ratingToWinrate } from "../lib/rating/ratings";

export function formatRating(rating: number): string {
    return formatPercentage(ratingToWinrate(rating));
}

export function formatPercentage(percentage: number): string {
    return parseFloat((percentage * 100).toFixed(2)).toString();
}
