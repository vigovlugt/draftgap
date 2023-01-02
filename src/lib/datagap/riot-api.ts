import { LolApi } from "twisted";
import { Queues, RegionGroups, Regions } from "twisted/dist/constants";
import { subDays } from "date-fns";
import { PrismaClient } from "@prisma/client";

const COUNT = 100;

export async function getAllMatches(
    api: LolApi,
    puuid: string,
    queue: number = 420,
    regionGroup = RegionGroups.EUROPE
) {
    let matchIds: string[] = [];

    let i = 0;

    const endDate = new Date();
    const startDate = subDays(endDate, 30);

    while (true) {
        const res = await api.MatchV5.list(puuid, regionGroup, {
            queue: queue,
            count: COUNT,
            start: i * COUNT,
            startTime: Math.round(startDate.valueOf() / 1000),
            endTime: Math.round(endDate.valueOf() / 1000),
        });
        i++;

        matchIds = matchIds.concat(res.response);

        if (res.response.length < COUNT) {
            return matchIds;
        }
    }
}

export async function getMatch(
    api: LolApi,
    client: PrismaClient,
    matchId: string,
    regionGroup = RegionGroups.EUROPE
) {
    if (await client.match.findFirst({ where: { id: matchId } })) return null;

    return (await api.MatchV5.get(matchId, regionGroup)).response;
}

export async function getSoloDuoRank(
    api: LolApi,
    puuid: string,
    region = Regions.EU_WEST
) {
    const res = await api.League.bySummoner(puuid, region);
    const soloDuo = res.response.find(
        (r) => r.queueType === Queues.RANKED_SOLO_5x5
    );
    return soloDuo;
}
