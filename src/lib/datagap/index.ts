import { PrismaClient } from "@prisma/client";
import { LolApi, Constants } from "twisted";
import { config } from "dotenv";
import { Queues, RegionGroups } from "twisted/dist/constants";
import { getAllMatches, getMatch } from "./riot-api";

const PUUID =
    "IcOlJwNiBV6Ky0MTknIC1ajtK1A7jcemR9TqagDaogPc9G_JQWH2eHMIlAV2wRo2IsrP9RMKsFaYbw";
const SOLO_DUO_QUEUE = 420;

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
