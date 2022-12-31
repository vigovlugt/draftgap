import { LolApi } from "twisted";
import { RegionGroups } from "twisted/dist/constants";

const COUNT = 100;

export async function getAllMatches(
    api: LolApi,
    puuid: string,
    queue: number = 420,
    regionGroup = RegionGroups.EUROPE
) {
    let matchIds: string[] = [];

    let i = 0;

    while (true) {
        const res = await api.MatchV5.list(puuid, regionGroup, {
            queue: queue,
            count: COUNT,
            start: i * COUNT,
            startTime: new Date("2022-01-01").getTime() / 1000,
            endTime: new Date("2022-11-16").getTime() / 1000,
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
    matchId: string,
    regionGroup = RegionGroups.EUROPE
) {
    return (await api.MatchV5.get(matchId, regionGroup)).response;
}
