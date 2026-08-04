import { Component, Match, Switch } from "solid-js";
import { RuneTable } from "./RuneTable";
import { useBuild } from "../../../contexts/BuildContext";
import { BootsStats } from "./BootsStats";
import { ItemStats } from "./ItemStats";
import { StarterItemStats } from "./StarterItemStats";
import { SummonerSpellsStats } from "./SummonerSpellsStats";
import { SkillStats } from "./SkillStats";
import { useUser } from "../../../contexts/UserContext";
import { t } from "../../../utils/i18n";

export const BuildView: Component = () => {
    const { query, buildAnalysisResult } = useBuild();
    const { config } = useUser();

    return (
        <>
            <Switch>
                <Match when={query.isLoading}>
                    <div class="text-neutral-50 text-2xl text-center grid place-items-center h-full">
                        {t(config, "loading")}
                    </div>
                </Match>
                <Match when={query.isError}>
                    <div class="text-red-500 text-2xl text-center grid place-items-center h-full">
                        {t(config, "errorFetchingBuildData")}
                    </div>
                </Match>
                <Match when={query.isSuccess && buildAnalysisResult}>
                    <div class="flex flex-col gap-20">
                        <div class="flex flex-col gap-8">
                            <h2 class="uppercase text-2xl font-semibold leading-none text-center">
                                {t(config, "preGame")}
                            </h2>
                            {/* <RecommendedBuild /> */}
                            <RuneTable />
                            <SummonerSpellsStats />
                        </div>
                        <div class="flex flex-col gap-8">
                            <h2 class="uppercase text-2xl font-semibold leading-none text-center">
                                {t(config, "inGame")}
                            </h2>
                            <StarterItemStats />
                            <SkillStats />
                            {/* <ItemSetStats /> */}
                            <BootsStats />
                            <ItemStats />
                        </div>
                    </div>
                </Match>
            </Switch>
        </>
    );
};
