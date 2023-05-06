import {
    Component,
    Match,
    Show,
    Switch,
    createEffect,
    createMemo,
    createSignal,
} from "solid-js";
import { useDraft } from "../../../context/DraftContext";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { fetchBuildData } from "../../../lib/builds/data";
import { analyzeBuild } from "../../../lib/builds/analysis";
import {
    FullBuildDataset,
    PartialBuildDataset,
} from "../../../lib/models/build/BuildDataset";
import { RuneTable } from "./RuneTable";
import { useBuild } from "../../../context/BuildContext";
import { RecommendedBuild } from "./RecommendedBuild";
import { BootsStats } from "./BootsStats";
import { ItemSetStats } from "./ItemSetStats";
import { ItemStats } from "./ItemStats";
import { StarterItemStats } from "./StarterItemStats";
import { SummonerSpellsStats } from "./SummonerSpellsStats";

export const BuildView: Component = (props) => {
    const { query, buildAnalysisResult } = useBuild();

    return (
        <>
            <Switch>
                <Match when={query.isLoading}>
                    <div class="text-neutral-50 text-2xl text-center grid place-items-center h-full">
                        Loading...
                    </div>
                </Match>
                <Match when={query.isError}>
                    <div class="text-red-500 text-2xl text-center grid place-items-center h-full">
                        Error while fetching build data
                    </div>
                </Match>
                <Match when={query.isSuccess && buildAnalysisResult}>
                    <div class="flex flex-col gap-8">
                        {/* <RecommendedBuild /> */}
                        <RuneTable />
                        {/* <SummonerSpellsStats /> */}
                        <StarterItemStats />
                        {/* <ItemSetStats /> */}
                        <BootsStats />
                        <ItemStats />
                    </div>
                </Match>
            </Switch>
        </>
    );
};
