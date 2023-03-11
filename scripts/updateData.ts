import * as dotenv from "dotenv";
dotenv.config();

import { getChampionDataFromLolalytics } from "../src/lib/data/lolalytics";
import { getVersions, getChampions } from "../src/lib/data/riot";
import { storeDataset } from "../src/lib/data/storage/storage";
import { ChampionData } from "../src/lib/models/ChampionData";
import {
    Dataset,
    deleteDatasetMatchupSynergyData,
} from "../src/lib/models/Dataset";
import { retry } from "../src/utils/fetch";

const BATCH_SIZE = 10;

async function main() {
    let currentVersion = (await getVersions())[0];
    console.log("Patch:", currentVersion);

    const champions = await getChampions(currentVersion);

    const datasetCurrentPatch = await getDataset(currentVersion, champions);
    const dataset30days = await getDataset("30", champions);

    deleteDatasetMatchupSynergyData(datasetCurrentPatch);

    await storeDataset(datasetCurrentPatch, { name: "current-patch" });
    await storeDataset(dataset30days, { name: "30-days" });
}

async function getDataset(
    version: string,
    champions: { id: string; key: string; name: string }[]
) {
    console.log("Getting dataset for version", version);
    const dataset: Dataset = {
        version: version,
        date: new Date().toISOString(),
        championData: {},
        rankData: { wins: 0, games: 0 },
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

    dataset.rankData.wins = Object.values(dataset.championData).reduce(
        (sum, champion) =>
            sum +
            Object.values(champion.statsByRole).reduce(
                (sum, stats) => sum + stats.wins,
                0
            ),
        0
    );
    dataset.rankData.games = Object.values(dataset.championData).reduce(
        (sum, champion) =>
            sum +
            Object.values(champion.statsByRole).reduce(
                (sum, stats) => sum + stats.games,
                0
            ),
        0
    );

    return dataset;
}

main();
