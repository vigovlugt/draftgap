import {
    LolalyticsChampionResponse,
    getLolalyticsChampion,
} from "../data/lolalytics/champion";
import { LOLALYTICS_ROLES } from "../data/lolalytics/roles";
import { Role } from "../models/Role";
import {
    FullBuildDataset,
    ItemsBuildData,
    PartialBuildDataset,
    RuneStats,
    RunesBuildData,
} from "../models/build/BuildDataset";
import { Dataset } from "../models/dataset/Dataset";

function getRunesBuildData(
    dataset: Dataset,
    championData: LolalyticsChampionResponse
) {
    const runes: RunesBuildData = {
        primary: {},
        secondary: {},
        shards: {
            offense: {},
            defense: {},
            flex: {},
        },
    };

    for (const [rawId, runesArray] of Object.entries(
        championData.runes.stats
    )) {
        // Rune or Shard ID
        const runeId = parseInt(rawId);
        // Whether this shard is in the flex slot (slot 1)
        const isFlexShard = rawId.at(-1) === "f";

        for (const [i, rune] of runesArray.map(
            (rune, i) => [i, rune] as const
        )) {
            const [_pickRate, winRate, games] = rune;
            const chosenAsSecondary = i === 1;

            const runeStats = {
                wins: Math.round(games * (winRate / 100)),
                games,
            } satisfies RuneStats;

            if (dataset.runeData[runeId]) {
                if (chosenAsSecondary) {
                    runes.secondary[runeId] = runeStats;
                } else {
                    runes.primary[runeId] = runeStats;
                }
            } else if (dataset.statShardData[runeId]) {
                if (isFlexShard) {
                    runes.shards.flex[runeId] = runeStats;
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
                        runes.shards.offense[runeId] = runeStats;
                    } else if (slot === 2) {
                        runes.shards.defense[runeId] = runeStats;
                    }
                }
            } else {
                throw new Error("Unknown rune/shard ID " + runeId);
            }
        }
    }

    return runes;
}

function getItemsBuildData(championData: LolalyticsChampionResponse) {
    const oneToFive = [1, 2, 3, 4, 5] as const;

    const items: ItemsBuildData = {
        boots: {},
        startingSets: {},
        sets: {},
        statsByOrder: oneToFive.map(() => ({})),
    };

    const parseItem = (itemData: LolalyticsChampionResponse["item1"][0]) => {
        const id = itemData[0];
        const winrate = itemData[1] / 100;
        const games = itemData[3];
        const wins = Math.round(games * winrate);
        return [id, { wins, games }] as const;
    };

    const parseSet = (setData: LolalyticsChampionResponse["startSet"][0]) => {
        let setItems: number[];
        if (typeof setData[0] === "number") {
            setItems = [setData[0]];
        } else {
            setItems = setData[0].split("_").map((id) => parseInt(id));
        }
        const winrate = setData[1] / 100;
        const games = setData[3];
        const wins = Math.round(games * winrate);
        return [setItems, { wins, games }] as const;
    };

    // Boots
    for (const itemData of championData.boots) {
        const [id, stats] = parseItem(itemData);
        // Skip no boots, magical footwear and base boots.
        if ([9999, 2422, 1001].includes(id)) {
            continue;
        }
        items.boots[id] = stats;
    }

    // Starting items
    for (const setData of championData.startSet) {
        const [setItems, stats] = parseSet(setData);
        items.startingSets[setItems.sort().join("_")] = stats;
    }

    // Items
    for (const n of oneToFive) {
        const order = n - 1;
        const orderItems = championData[`item${n}`] ?? [];
        for (const itemData of orderItems) {
            const [id, stats] = parseItem(itemData);
            items.statsByOrder[order][id] = stats;
        }
    }

    return items;
}

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
        runes: getRunesBuildData(dataset, championData),
        items: getItemsBuildData(championData),
    };

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
        matchups: matchupData.map((matchup) => ({
            championKey: matchup.championKey,
            role: matchup.role,
            wins: Math.round(
                (matchup.championData.header.n *
                    matchup.championData.header.wr) /
                    100
            ),
            games: matchup.championData.header.n,
            runes: getRunesBuildData(dataset, matchup.championData),
            items: getItemsBuildData(matchup.championData),
        })),
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
        ([opponentRole, opponentChampionKey]) =>
            getLolalyticsChampion(
                "30",
                championKey,
                LOLALYTICS_ROLES[role],
                opponentChampionKey,
                LOLALYTICS_ROLES[opponentRole]
            ).then((championData) => ({
                championKey: opponentChampionKey,
                role: opponentRole,
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
