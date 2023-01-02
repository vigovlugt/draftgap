import { PrismaClient } from "@prisma/client";
import { LolApi } from "twisted";
import { config } from "dotenv";
import { Tiers } from "twisted/dist/constants";
import {
    getAllMatches as getRecentMatches,
    getMatch,
    getSoloDuoRank,
} from "./riot-api";
import { setSummonerRank, setSummonerScraped, storeMatches } from "./db";

const PUUID =
    "IcOlJwNiBV6Ky0MTknIC1ajtK1A7jcemR9TqagDaogPc9G_JQWH2eHMIlAV2wRo2IsrP9RMKsFaYbw";
const SUMMONER_ID = "wchFCnWRpAAvEWeojWP2aAq96uo2nBmqp64SFY-8b1ZcL1k";

const SOLO_DUO_QUEUE = 420;

type AppContext = {
    client: PrismaClient;
    api: LolApi;
};

async function getSummonerToScrape(ctx: AppContext): Promise<
    | {
          summonerId: string;
          puuid: string;
      }
    | undefined
> {
    if ((await ctx.client.summoner.count()) === 0) {
        await ctx.client.summoner.create({
            data: {
                summonerId: SUMMONER_ID,
                puuid: PUUID,
            },
        });
    }

    const summoner = await ctx.client.summoner.findFirst({
        where: {
            OR: [
                {
                    rank: {
                        equals: null,
                    },
                },
                {
                    rank: {
                        in: [
                            Tiers.PLATINUM,
                            Tiers.DIAMOND,
                            Tiers.MASTER,
                            Tiers.GRANDMASTER,
                            Tiers.CHALLENGER,
                        ],
                    },
                },
            ],
            scrapedAt: null,
        },
    });
    if (!summoner) {
        return;
    }

    return {
        summonerId: summoner.summonerId,
        puuid: summoner.puuid,
    };
}

async function scrapeSummoner(
    ctx: AppContext,
    summoner: {
        summonerId: string;
        puuid: string;
    }
) {
    const rank = await getSoloDuoRank(ctx.api, summoner.summonerId);
    await setSummonerRank(ctx.client, summoner.puuid, rank?.tier || "UNRANKED");
    if (
        !rank ||
        ![
            Tiers.PLATINUM,
            Tiers.DIAMOND,
            Tiers.MASTER,
            Tiers.GRANDMASTER,
            Tiers.CHALLENGER,
        ].includes(rank.tier as Tiers)
    ) {
        return;
    }

    const matchIds = await getRecentMatches(ctx.api, summoner.puuid);

    const matches = [];
    for (let i = 0; i < matchIds.length; i += 32) {
        const batch = matchIds.slice(i, i + 32);
        const matchData = await Promise.all(
            batch.map((match) => getMatch(ctx.api, ctx.client, match))
        );
        matches.push(...matchData);
    }

    // Store only new matches
    await storeMatches(ctx.client, matches.filter((m) => m) as any[]);
    await setSummonerScraped(ctx.client, summoner.puuid);
}

async function main() {
    config();

    const api = new LolApi({
        key: process.env.RIOT_API_KEY,
        concurrency: 32,
        rateLimitRetry: true,
        rateLimitRetryAttempts: Infinity,
    });
    const client = new PrismaClient({
        log: ["query", "info", "warn", "error"],
    });

    while (true) {
        const summoner = await getSummonerToScrape({ client, api });
        if (!summoner) {
            console.log("No summoners to scrape");
            return;
        }

        console.log("Scraping summoner", summoner.puuid);
        await scrapeSummoner({ client, api }, summoner);
    }
}

main();
