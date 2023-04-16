import {
    LolalyticsChampionResponse,
    getLolalyticsChampion,
} from "../data/lolalytics/champion";
import {
    LolalyticsChampion2Response,
    getLolalyticsChampion2,
} from "../data/lolalytics/champion2";
import { LOLALYTICS_ROLES } from "../data/lolalytics/roles";
import { Role } from "../models/Role";
import {
    FullBuildDataset,
    PartialBuildDataset,
    RuneStats,
    RunesBuildData,
} from "../models/build/BuildDataset";

function partialDatasetFromLolalyticsData(
    championKey: string,
    role: Role,
    championData: LolalyticsChampionResponse,
    champion2Data: LolalyticsChampion2Response
) {
    const partialDataset: PartialBuildDataset = {
        championKey,
        role,
        wins: Math.round(
            (championData.header.n * championData.header.wr) / 100
        ),
        games: championData.header.n,
        runes: {
            statsByRune: {},
        },
    };

    return partialDataset;
}

function fullDatasetFromLolalyticsData(
    championKey: string,
    role: Role,
    championData: LolalyticsChampionResponse,
    champion2Data: LolalyticsChampion2Response,
    matchupData: {
        championKey: string;
        role: Role;
        championData: LolalyticsChampionResponse;
        champion2Data: LolalyticsChampion2Response;
    }[]
) {
    const partialDataset = partialDatasetFromLolalyticsData(
        championKey,
        role,
        championData,
        champion2Data
    );

    const fullDataset: FullBuildDataset = {
        ...partialDataset,
        matchups: [],
    };

    return fullDataset;
}

function runesDataFromLolalyticsData(championData: LolalyticsChampionResponse) {
    const runesData: RunesBuildData = {
        // TODO: to primary/secondary/shards based on ddragon data
        statsByRune: Object.fromEntries(
            Object.entries(championData.runes.stats).map(([runeId, stats]) => [
                runeId,
                {
                    wins: stats[0][],

                } satisfies RuneStats
            ])
        ),
    };

    return runesData;
}

export async function fetchBuildData(
    patch: string,
    championKey: string,
    role: Role,
    opponentTeamComp: Map<Role, string>
) {
    // convert patch from 13.7.1 to 13.7
    patch = patch.split(".").slice(0, 2).join(".");

    const championPatchDataPromises = getLolalyticsChampion(
        patch,
        championKey,
        LOLALYTICS_ROLES[role]
    );
    const champion2PatchDataPromises = getLolalyticsChampion2(
        patch,
        championKey,
        LOLALYTICS_ROLES[role]
    );
    const champion30DaysDataPromises = getLolalyticsChampion(
        "30",
        championKey,
        LOLALYTICS_ROLES[role]
    );
    const champion2_30DaysDataPromises = getLolalyticsChampion2(
        "30",
        championKey,
        LOLALYTICS_ROLES[role]
    );

    const matchup30DaysDataPromises = [...opponentTeamComp.entries()].map(
        ([role, championKey]) =>
            Promise.all([
                getLolalyticsChampion(
                    "30",
                    championKey,
                    LOLALYTICS_ROLES[role]
                ),
                getLolalyticsChampion2(
                    "30",
                    championKey,
                    LOLALYTICS_ROLES[role]
                ),
            ]).then(([championData, champion2Data]) => ({
                championKey,
                role,
                championData,
                champion2Data,
            }))
    );

    const results = await Promise.all([
        championPatchDataPromises,
        champion2PatchDataPromises,
        champion30DaysDataPromises,
        champion2_30DaysDataPromises,
        ...matchup30DaysDataPromises,
    ]);
    const [
        championPatchData,
        champion2PatchData,
        champion30DaysData,
        champion2_30DaysData,
        ...matchup30DaysData
    ] = results;

    const partialDataset = partialDatasetFromLolalyticsData(
        championKey,
        role,
        championPatchData,
        champion2PatchData
    );

    const fullDataset = fullDatasetFromLolalyticsData(
        championKey,
        role,
        champion30DaysData,
        champion2_30DaysData,
        matchup30DaysData
    );

    return [partialDataset, fullDataset] as const;
}
