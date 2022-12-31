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
        championData: {},
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

    await storeDataset(dataset);
}

main();
