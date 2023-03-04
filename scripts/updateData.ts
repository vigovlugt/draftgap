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

const BATCH_SIZE = 10;

async function main() {
    let currentVersion = (await getVersions())[0];
    console.log("Patch:", currentVersion);

    const champions = await getChampions(currentVersion);

    const dataset30days = await getDataset("30", champions);
    await storeDataset(dataset30days, { name: "30-days" });

    const datasetCurrentPatch = await getDataset(currentVersion, champions);
    deleteDatasetMatchupSynergyData(datasetCurrentPatch);
    await storeDataset(datasetCurrentPatch, { name: "current-patch" });
}

async function getDataset(
    version: string,
    champions: { id: string; key: string; name: string }[]
) {
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
        const championData = (
            await Promise.allSettled(
                batch.map((champion) =>
                    getChampionDataFromLolalytics(version, champion)
                )
            )
        )
            .filter(
                (result): result is PromiseFulfilledResult<ChampionData> =>
                    result.status === "fulfilled"
            )
            .map((result) => result.value);

        for (const champion of championData) {
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
