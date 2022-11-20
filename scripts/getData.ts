import * as fs from "fs/promises";
import { getChampionDataFromLolalytics } from "../src/lib/data/lolalytics";
import { getVersions, getChampions } from "../src/lib/data/riot";
import { ChampionData } from "../src/lib/models/ChampionData";
import { Dataset, getSerializedDataset } from "../src/lib/models/Dataset";

const BATCH_SIZE = 10;

async function main() {
    let currentVersion = (await getVersions())[1];
    console.log("Patch:", currentVersion);

    const champions = await getChampions(currentVersion);

    const dataset: Dataset = {
        version: currentVersion,
        championData: {},
    };

    currentVersion = "30";

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
                    getChampionDataFromLolalytics(currentVersion, champion)
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

    // distributeMatchupWinrates(dataset);

    await fs.writeFile(
        `./public/data/datasets/${currentVersion}.json`,
        JSON.stringify(dataset)
    );

    await fs.writeFile(
        `./public/data/datasets/${currentVersion}.bin`,
        Buffer.from(getSerializedDataset(dataset))
    );
}

main();
