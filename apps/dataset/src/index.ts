import "dotenv/config";
import { getChampionDataFromLolalytics } from "./lolalytics";
import { deleteDatasetMatchupSynergyData, Dataset, removeRankBias } from "draftgap-core/src/models/dataset/Dataset";
import { ItemData } from "draftgap-core/src/models/dataset/ItemData";
import { RuneData, RunePathData } from "draftgap-core/src/models/dataset/RuneData";
import { storeDataset } from "./storage/storage";
import { getVersions, getChampions, getRunes, getItems, RiotRunePath, RiotItem, RiotChampion, getSummonerSpells, RiotSummonerSpell } from "./riot";
import { SummonerSpellData } from "draftgap-core/src/models/dataset/SummonerSpellData";

const BATCH_SIZE = 10;

// TODO: Move to Riot API if exists?
const STAT_SHARD_DATA = {
    5001: {
        id: 5001,
        key: "HealthScaling",
        name: "Health",
        positions: [{ slot: 2, index: 0 }],
    },
    5002: {
        id: 5002,
        key: "Armor",
        name: "Armor",
        positions: [
            { slot: 1, index: 1 },
            { slot: 2, index: 1 },
        ],
    },
    5003: {
        id: 5003,
        key: "MagicRes",
        name: "Magic Resist",
        positions: [
            { slot: 1, index: 2 },
            { slot: 2, index: 2 },
        ],
    },
    5005: {
        id: 5005,
        key: "AttackSpeed",
        name: "Attack Speed",
        positions: [{ slot: 0, index: 1 }],
    },
    5007: {
        id: 5007,
        key: "CDRScaling",
        name: "Ability Haste",
        positions: [{ slot: 0, index: 2 }],
    },
    5008: {
        id: 5008,
        key: "AdaptiveForce",
        name: "Adaptive Force",
        positions: [
            { slot: 0, index: 0 },
            { slot: 1, index: 0 },
        ],
    },
};

async function main() {
    const currentVersion = (await getVersions())[0];
    console.log("Patch:", currentVersion);

    const [champions, runes, items, summonerSpells] = await Promise.all([
        getChampions(currentVersion),
        getRunes(currentVersion),
        getItems(currentVersion),
        getSummonerSpells(currentVersion),
    ]);

    const datasetCurrentPatch = await getDataset(
        currentVersion,
        champions,
        runes,
        items,
        summonerSpells
    );
    const dataset30days = await getDataset("30", champions, runes, items, summonerSpells);

    deleteDatasetMatchupSynergyData(datasetCurrentPatch);

    await storeDataset(datasetCurrentPatch, { name: "current-patch" });
    await storeDataset(dataset30days, { name: "30-days" });
}

function riotRunesToRuneData(runes: RiotRunePath[]) {
    const data = {
        runeData: Object.fromEntries(
            runes
                .map((path) => {
                    return path.slots.map((slot, slotIndex) =>
                        slot.runes.map(
                            (r, i) =>
                                [
                                    r.id,
                                    {
                                        id: r.id,
                                        key: r.key,
                                        name: r.name,
                                        pathId: path.id,
                                        icon: r.icon,
                                        slot: slotIndex,
                                        index: i,
                                    } satisfies RuneData,
                                ] as const
                        )
                    );
                })
                .flat()
                .flat()
        ),
        runePathData: Object.fromEntries(
            runes.map(
                (r) =>
                    [
                        r.id,
                        {
                            id: r.id,
                            key: r.key,
                            name: r.name,
                            icon: r.icon,
                        } satisfies RunePathData,
                    ] as const
            )
        ),
        statShardData: STAT_SHARD_DATA,
    } satisfies Pick<Dataset, "runeData" | "runePathData" | "statShardData">;

    return data;
}

function riotItemsToItemData(
    items: Record<string, RiotItem>
): Record<number, ItemData> {
    return Object.fromEntries(
        Object.entries(items).map(
            ([id, item]) =>
                [
                    id,
                    {
                        id: parseInt(id),
                        name: item.name,
                        gold: item.gold.total,
                    },
                ] as const
        )
    );
}

function riotSummonerSpellsToSummonerSpellData(
    summonerSpells: Record<string, RiotSummonerSpell>
): Record<string, SummonerSpellData> {
    return Object.fromEntries(
        Object.entries(summonerSpells).map(
            ([id, spell]) =>
                [
                    spell.key,
                    {
                        id,
                        key: +spell.key,
                        name: spell.name,
                    },
                ] as const
        )
    );
}

async function getDataset(
    version: string,
    champions: RiotChampion[],
    runes: RiotRunePath[],
    items: Record<string, RiotItem>,
    summonerSpells: Record<string, RiotSummonerSpell>
) {
    console.log("Getting dataset for version", version);
    const dataset: Dataset = {
        version: version,
        date: new Date().toISOString(),
        championData: {},
        ...riotRunesToRuneData(runes),
        itemData: riotItemsToItemData(items),
        summonerSpellData: riotSummonerSpellsToSummonerSpellData(summonerSpells)
    };

    for (let i = 0; i < champions.length; i += BATCH_SIZE) {
        console.log(
            `Processing batch ${i / BATCH_SIZE} of ${Math.ceil(
                champions.length / BATCH_SIZE
            )}`
        );
        const batch = champions.slice(i, i + BATCH_SIZE);
        const championData = await Promise.all(
            batch.map(
                async (champion) =>
                    [
                        champion,
                        await getChampionDataFromLolalytics(version, champion),
                    ] as const
            )
        );

        for (const [c, champion] of championData) {
            if (!champion) {
                console.log(
                    "Skipping champion " +
                    c.name +
                    " as it lolalytics has no data for it"
                );
                continue;
            }

            dataset.championData[champion.key] = champion;
        }
    }

    removeRankBias(dataset);

    return dataset;
}

main();