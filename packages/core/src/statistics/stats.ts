export function calculateWilsonCI(
    wins: number,
    games: number,
    confidence: 0.95 | 0.99 | 0.999 | 0,
) {
    if (confidence === 0) {
        return [wins / games, wins / games];
    }

    const z = getZ(confidence);
    const p = wins / games;
    const n = games;
    const numerator = p + (z * z) / (2 * n);
    const denominator = 1 + (z * z) / n;
    const ci =
        (z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / denominator;
    return [numerator / denominator - ci, numerator / denominator + ci];
}

function getZ(confidence: 0.95 | 0.99 | 0.999) {
    return {
        0.95: 1.96,
        0.99: 2.58,
        0.999: 3.29,
    }[confidence];
}
