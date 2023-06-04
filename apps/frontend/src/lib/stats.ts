import { ratingToWinrate, winrateToRating } from "./rating/ratings";

export function addStats(...stats: { wins: number; games: number }[]) {
    let wins = 0;
    let games = 0;

    for (const stat of stats) {
        wins += stat.wins;
        games += stat.games;
    }

    return {
        wins,
        games,
    };
}

export function multiplyStats(
    stats: { wins: number; games: number },
    number: number
) {
    return {
        wins: stats.wins * number,
        games: stats.games * number,
    };
}

export function divideStats(
    stats: { wins: number; games: number },
    number: number
) {
    return {
        wins: stats.wins / number,
        games: stats.games / number,
    };
}

export function averageStats(...stats: { wins: number; games: number }[]) {
    return divideStats(addStats(...stats), stats.length);
}

export function removeBiasStats(
    stats: {
        wins: number;
        games: number;
    },
    biasRating: number
) {
    return {
        wins:
            ratingToWinrate(
                winrateToRating(stats.wins / stats.games) - biasRating
            ) * stats.games,
        games: stats.games - biasRating,
    };
}
