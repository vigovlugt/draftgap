import {
    LolalyticsChampionResponse,
    getLolalyticsChampion,
} from "../data/lolalytics/champion";
import { LOLALYTICS_ROLES } from "../data/lolalytics/roles";
import { Role } from "../models/Role";
import {
    FullBuildDataset,
    PartialBuildDataset,
    RuneStats,
} from "../models/build/BuildDataset";
import { Dataset } from "../models/dataset/Dataset";

function partialDatasetFromLolalyticsData(
    dataset: Dataset,
    championKey: string,
    role: Role,
    championData: LolalyticsChampionResponse
) {
    const partialDataset: PartialBuildDataset = {
        championKey,
        role,
        wins: Math.round(
            (championData.header.n * championData.header.wr) / 100
        ),
        games: championData.header.n,
        runes: {
            primary: {},
            secondary: {},
            shards: {
                offense: {},
                defense: {},
                flex: {},
            },
        },
    };

    // Fill runes and shards
    for (const [rawId, runes] of Object.entries(championData.runes.stats)) {
        // Rune or Shard ID
        const runeId = parseInt(rawId);
        // Whether this shard is in the flex slot (slot 1)
        const isFlexShard = rawId.at(-1) === "f";

        for (const [i, rune] of runes.map((rune, i) => [i, rune] as const)) {
            const [_pickRate, winRate, games] = rune;
            const chosenAsSecondary = i === 1;

            const runeStats = {
                wins: Math.round(games * (winRate / 100)),
                games,
            } satisfies RuneStats;

            if (dataset.runeData[runeId]) {
                if (chosenAsSecondary) {
                    partialDataset.runes.secondary[runeId] = runeStats;
                } else {
                    partialDataset.runes.primary[runeId] = runeStats;
                }
            } else if (dataset.statShardData[runeId]) {
                if (isFlexShard) {
                    partialDataset.runes.shards.flex[runeId] = runeStats;
                } else {
                    const slot = dataset.statShardData[runeId].positions.find(
                        (p) => p.slot !== 1
                    )?.slot;
                    if (slot === undefined) {
                        throw new Error(
                            "Shard has no slot other than flex " + runeId
                        );
                    }
                    if (slot === 0) {
                        partialDataset.runes.shards.offense[runeId] = runeStats;
                    } else if (slot === 2) {
                        partialDataset.runes.shards.defense[runeId] = runeStats;
                    }
                }
            } else {
                throw new Error("Unknown rune/shard ID " + runeId);
            }
        }
    }

    return partialDataset;
}

function fullDatasetFromLolalyticsData(
    dataset: Dataset,
    championKey: string,
    role: Role,
    championData: LolalyticsChampionResponse,
    matchupData: {
        championKey: string;
        role: Role;
        championData: LolalyticsChampionResponse;
    }[]
) {
    const partialDataset = partialDatasetFromLolalyticsData(
        dataset,
        championKey,
        role,
        championData
    );

    const fullDataset: FullBuildDataset = {
        ...partialDataset,
        matchups: [],
    };

    return fullDataset;
}

export async function fetchBuildData(
    dataset: Dataset,
    championKey: string,
    role: Role,
    opponentTeamComp: Map<Role, string>
) {
    // convert patch from 13.7.1 to 13.7
    const patch = dataset.version.split(".").slice(0, 2).join(".");

    const championPatchDataPromises = getLolalyticsChampion(
        patch,
        championKey,
        LOLALYTICS_ROLES[role]
    );
    const champion30DaysDataPromises = getLolalyticsChampion(
        "30",
        championKey,
        LOLALYTICS_ROLES[role]
    );

    const matchup30DaysDataPromises = [...opponentTeamComp.entries()].map(
        ([role, championKey]) =>
            getLolalyticsChampion(
                "30",
                championKey,
                LOLALYTICS_ROLES[role]
            ).then((championData) => ({
                championKey,
                role,
                championData,
            }))
    );

    const results = await Promise.all([
        championPatchDataPromises,
        champion30DaysDataPromises,
        ...matchup30DaysDataPromises,
    ]);
    const [championPatchData, champion30DaysData, ...matchup30DaysData] =
        results;

    const partialDataset = partialDatasetFromLolalyticsData(
        dataset,
        championKey,
        role,
        championPatchData
    );

    const fullDataset = fullDatasetFromLolalyticsData(
        dataset,
        championKey,
        role,
        champion30DaysData,
        matchup30DaysData
    );

    return [partialDataset, fullDataset] as const;
}
