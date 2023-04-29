export function addStats(
    stats: { wins: number; games: number },
    stats2: { wins: number; games: number }
) {
    return {
        wins: stats.wins + stats2.wins,
        games: stats.games + stats2.games,
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
