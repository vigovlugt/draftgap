import {
    ratingToWinrate,
    winrateToRating,
} from "@draftgap/core/src/rating/ratings";
import { getChampions, getVersions } from "./riot";
import { getDataset, storeDataset } from "./storage/storage";
import { Browser, chromium } from "playwright";
import { defaultChampionRoleData } from "@draftgap/core/src/models/dataset/ChampionRoleData";

// TO REVERT: DELETE THIS FILE
// SET PACKAGE JSON start back to index.ts
// REMOVE PLAYWRIGHT FROM PACKAGE.JSON

async function scrapePage(browser: Browser, role: string) {
    const page = await browser.newPage({
        screen: {
            height: 10000,
            width: 1920,
        },
    });

    await page.goto("https://lolalytics.com/lol/tierlist/?lane=" + role);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const minRole = page.locator('input[value="2"]');
    const minGames = page.locator('input[value="100"]');

    await minRole.fill("");
    await minRole.press("0");
    await minGames.fill("");
    await minGames.press("0");

    for (let i = 0; i < 100; i++) {
        await page.mouse.wheel(0, 100);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return await page.evaluate(() => {
        const rows = Array.from(
            document.querySelectorAll(
                "div.odd\\:bg-\\[\\#181818\\].even\\:bg-\\[\\#101010\\]"
            )
        ).map((el) => {
            const name = (
                el.children[2].children[0] as HTMLAnchorElement
            ).innerText.trim();
            const winRate =
                parseFloat(
                    (
                        el.children[5].children[0]
                            .children[0] as HTMLSpanElement
                    ).innerText.trim()
                ) / 100;
            const games = parseInt(
                (el.children[9] as HTMLDivElement).innerText
                    .trim()
                    .replaceAll(",", "")
            );

            return {
                name,
                wins: winRate * games,
                games,
            };
        });

        const rankWinrate =
            parseFloat(
                document
                    .querySelector(
                        "div.flex.h-\\[51px\\].flex-1.items-center.text-xs"
                    )!
                    .children[0].childNodes[2].textContent!.trim()
            ) / 100;

        return {
            rows,
            rankWinrate,
        };
    });
}

async function main() {
    const browser = await chromium.launch();

    const currentVersion = (await getVersions())[0];
    const champions = await getChampions(currentVersion);
    console.log("Patch:", currentVersion);

    const datas = await Promise.all([
        scrapePage(browser, "top"),
        scrapePage(browser, "jungle"),
        scrapePage(browser, "middle"),
        scrapePage(browser, "bottom"),
        scrapePage(browser, "support"),
    ]);

    const data = datas
        .map(
            (d, i) =>
                d.rows
                    .map((row) => {
                        const champion = champions.find(
                            (c) => c.name === row.name
                        );
                        if (!champion) {
                            console.log("No champion found for", row.name);
                            return null;
                        }

                        // Remove rank bias
                        const rankRating = winrateToRating(d.rankWinrate);
                        const newWins =
                            ratingToWinrate(
                                winrateToRating(row.wins / row.games) -
                                    rankRating
                            ) * row.games;

                        return {
                            wins: newWins,
                            championId: champion.key,
                            games: row.games,
                            role: i,
                        };
                    })
                    .filter((r) => r) as {
                    championId: string;
                    wins: number;
                    games: number;
                    role: number;
                }[]
        )
        .flat();

    await browser.close();

    const currentDataset = await getDataset({ name: "current-patch" });

    for (const stat of data) {
        if (!currentDataset.championData[stat.championId]) {
            currentDataset.championData[stat.championId] = {
                id: stat.championId,
                key: champions.find((c) => c.key === stat.championId)!.key,
                name: champions.find((c) => c.key === stat.championId)!.name,
                statsByRole: {
                    0: defaultChampionRoleData(),
                    1: defaultChampionRoleData(),
                    2: defaultChampionRoleData(),
                    3: defaultChampionRoleData(),
                    4: defaultChampionRoleData(),
                },
            };
        }

        const obj =
            currentDataset.championData[stat.championId]?.statsByRole[
                stat.role as 0 | 1 | 2 | 3 | 4
            ];

        obj.wins = stat.wins;
        obj.games = stat.games;
    }

    currentDataset.version = currentVersion;
    currentDataset.date = new Date().toISOString();

    await storeDataset(currentDataset, { name: "current-patch" });
}
main();
