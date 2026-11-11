import {
    DATASET_DAYS,
    DATASET_TIER,
} from "@draftgap/core/src/models/dataset/Dataset";
import type {
    ChampionPatchChange,
    PatchChangeType,
} from "@draftgap/core/src/models/dataset/PatchChange";
import { getRoleFromString } from "@draftgap/core/src/models/Role";
import { getPatchReleaseDate } from "../riot";
import { retry } from "../utils";
import { extractQwikData } from "./qwik";
import type { LolalyticsRole } from "./roles";

// Patches are at least a week apart, so the period can not contain more
const MAX_PATCHES = Math.ceil(DATASET_DAYS / 7);

type LolalyticsLaneChange = {
    lane: LolalyticsRole;
    wr: number;
    deltaWr: number;
};

type LolalyticsChampionChange = LolalyticsLaneChange & {
    cid: number;
    secondary: LolalyticsLaneChange[];
};

type LolalyticsPatchNotes = {
    // [patch, previous patch]
    patches: [string, string];
    changes: {
        buffs: LolalyticsChampionChange[];
        nerfs: LolalyticsChampionChange[];
        adjusted: LolalyticsChampionChange[];
    };
};

// The patch notes champion performance of the lolalytics front page
async function getLolalyticsPatchNotes(patch: string) {
    const queryParams = new URLSearchParams();
    queryParams.append("tier", DATASET_TIER);
    queryParams.append("patch", patch);

    const url = `https://lolalytics.com/?${queryParams.toString()}`;
    const res = await retry(() => fetch(url));
    if (!res.ok) {
        throw new Error(
            "Failed to fetch lolalytics patch notes " + url + " " + res.status,
        );
    }

    const data = extractQwikData<LolalyticsPatchNotes | undefined>(
        await res.text(),
        (obj) => obj["patches"] !== undefined && obj["changes"] !== undefined,
    );
    // Lolalytics shows the current patch when it does not know the patch (yet)
    if (data?.patches[0] !== patch) {
        return undefined;
    }

    return data;
}

// Champions buffed, nerfed or adjusted by the patches released in the dataset period, by champion key
export async function getPatchChanges(versions: string[]) {
    const periodStart = Date.now() - DATASET_DAYS * 24 * 60 * 60 * 1000;
    // convert versions from ex. 12.21.1 to 12.21
    const patches = [
        ...new Set(versions.map((v) => v.split(".").slice(0, 2).join("."))),
    ].slice(0, MAX_PATCHES);

    const patchChanges: Record<string, ChampionPatchChange[]> = {};

    for (const patch of patches) {
        const version = versions.find((v) => v.startsWith(patch + "."))!;
        const releaseDate = await getPatchReleaseDate(version);
        if (releaseDate && releaseDate.getTime() < periodStart) {
            break;
        }

        const patchNotes = await getLolalyticsPatchNotes(patch);
        if (patchNotes) {
            const changesByType: [PatchChangeType, LolalyticsChampionChange[]][] =
                [
                    ["buff", patchNotes.changes.buffs],
                    ["nerf", patchNotes.changes.nerfs],
                    ["adjusted", patchNotes.changes.adjusted],
                ];
            for (const [type, changes] of changesByType) {
                for (const change of changes) {
                    (patchChanges[change.cid] ??= []).push({
                        patch,
                        type,
                        roleStats: [change, ...change.secondary].map((c) => ({
                            role: getRoleFromString(c.lane),
                            winrate: c.wr,
                            delta: c.deltaWr,
                        })),
                    });
                }
            }
            console.log(
                `Patch ${patch} changes: ${patchNotes.changes.buffs.length} buffs, ${patchNotes.changes.nerfs.length} nerfs, ${patchNotes.changes.adjusted.length} adjusted`,
            );
        }

        // Without a release date, only assume the current patch is in the period
        if (!releaseDate) {
            break;
        }
    }

    return patchChanges;
}
