import * as fs from "fs/promises";
import {
    // distributeMatchupWinrates,
    getChampionDataFromLolalytics,
} from "../src/lib/data/lolalytics";
import { getVersions, getChampions } from "../src/lib/data/riot";
import { ChampionData } from "../src/lib/models/ChampionData";

const BATCH_SIZE = 10;

async function main() {
    let currentVersion = (await getVersions())[1];
    console.log("Patch:", currentVersion);

    const champions = await getChampions(currentVersion);

    currentVersion = "30";

    const dataset: Record<string, ChampionData> = {};
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
            dataset[champion.key] = champion;
        }
    }

    // distributeMatchupWinrates(dataset);

    await fs.writeFile(
        `./public/data/datasets/${currentVersion}.json`,
        JSON.stringify(dataset)
    );
}

main();
