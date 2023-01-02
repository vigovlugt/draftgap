import { PrismaClient } from "@prisma/client";
import { LolApi, Constants } from "twisted";
import { config } from "dotenv";
import { Queues, RegionGroups } from "twisted/dist/constants";
import { getAllMatches, getMatch } from "./riot-api";
import { setSummonerScraped, storeMatches } from "./db";

const PUUID =
    "IcOlJwNiBV6Ky0MTknIC1ajtK1A7jcemR9TqagDaogPc9G_JQWH2eHMIlAV2wRo2IsrP9RMKsFaYbw";
const SOLO_DUO_QUEUE = 420;

type AppContext = {
    client: PrismaClient;
    api: LolApi;
};

async function scrapeSummoner(ctx: AppContext, puuid: string) {
    const matchIds = await getAllMatches(ctx.api, puuid);

    const matches = [];
    for (let i = 0; i < matchIds.length; i += 32) {
        const batch = matchIds.slice(i, i + 32);
        const matchData = await Promise.all(
            batch.map((match) => getMatch(ctx.api, match))
        );
        matches.push(...matchData);
    }

    await storeMatches(ctx.client, matches);
    await setSummonerScraped(ctx.client, puuid);
}

async function main() {
    config();

    const api = new LolApi({
        key: process.env.RIOT_API_KEY,
        concurrency: 32,
        rateLimitRetry: true,
    });
    const client = new PrismaClient();

    console.log("Fetching matches...");
    const matchIds = await getAllMatches(api, PUUID);
    for (const match of matchIds) {
        const m = await getMatch(api, match);
        console.log(JSON.stringify(m, null, 2));
    }
}

main();
