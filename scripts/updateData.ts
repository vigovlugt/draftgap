import * as dotenv from "dotenv";
dotenv.config();

import { getChampionDataFromLolalytics } from "../src/lib/data/lolalytics";
import { getVersions, getChampions } from "../src/lib/data/riot";
import { storeDataset } from "../src/lib/data/storage/storage";
import { ChampionData } from "../src/lib/models/ChampionData";
import { Dataset } from "../src/lib/models/Dataset";

const BATCH_SIZE = 10;

async function main() {
    let currentVersion = (await getVersions())[0];
    console.log("Patch:", currentVersion);

    const champions = await getChampions(currentVersion);

    const dataset: Dataset = {
        version: currentVersion,
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
                batch.map(
                    (champion) => getChampionDataFromLolalytics("30", champion)
                    //getChampionDataFromLolalytics(currentVersion, champion)
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

    await storeDataset(dataset);
}

main();
