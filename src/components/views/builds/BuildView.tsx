import { Component, Match, Switch } from "solid-js";
import { RuneTable } from "./RuneTable";
import { useBuild } from "../../../context/BuildContext";
import { BootsStats } from "./BootsStats";
import { ItemStats } from "./ItemStats";
import { StarterItemStats } from "./StarterItemStats";

export const BuildView: Component = () => {
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
