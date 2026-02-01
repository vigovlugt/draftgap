import { SkillOrder } from "@draftgap/core/src/models/build/BuildDataset";
import { useBuild } from "../../../contexts/BuildContext";
import { Panel, PanelHeader } from "../../common/Panel";
import { VerticalEntityStats } from "./EntityStats";
import { For, Show } from "solid-js";
import { Icon } from "solid-heroicons";
import { chevronRight } from "solid-heroicons/solid";
import { formatPercentage, getRatingClass } from "../../../utils/rating";
import { ratingToWinrate } from "@draftgap/core/src/rating/ratings";

export function SkillStats() {
    const { buildAnalysisResult, partialBuildDataset, setSelectedEntity } =
        useBuild();

    const totalOrderGames = () =>
        Object.values(partialBuildDataset()!.skills.order).reduce(
            (acc, skill) => acc + skill.games,
            0,
        );

    const totalGamesByLevel = () =>
        partialBuildDataset()!.skills.level.map((level) =>
            Object.values(level).reduce((acc, skill) => acc + skill.games, 0),
        );

    return (
        <div class="flex gap-4">
            <Panel>
                <PanelHeader>Skill Priority</PanelHeader>
                <VerticalEntityStats
                    data={(
                        Object.keys(
                            buildAnalysisResult()!.skills.order,
                        ) as SkillOrder[]
                    ).filter(
                        (id) =>
                            partialBuildDataset()!.skills.order[id].games /
                                totalOrderGames() >
                            0.05,
                    )}
                    getGames={(id) =>
                        partialBuildDataset()!.skills.order[id].games
                    }
                    getRating={(id) =>
                        buildAnalysisResult()!.skills.order[id].totalRating
                    }
                >
                    {([id, games, rating]) => (
                        <tr
                            onClick={() =>
                                setSelectedEntity({
                                    type: "skills",
                                    skillsType: "order",
                                    id,
                                })
                            }
                        >
                            <td class="py-3 pl-3 text-3xl flex gap-1 items-center">
                                <For
                                    each={id
                                        .split("")
                                        .map(
                                            (ability, i) =>
                                                [ability, i] as const,
                                        )}
                                >
                                    {([ability, i]) => (
                                        <>
                                            <span>{ability}</span>
                                            <Show when={i < 2}>
                                                <Icon
                                                    path={chevronRight}
                                                    class="w-5 h-5"
                                                    stroke-width={1}
                                                    stroke="currentColor"
                                                />
                                            </Show>
                                        </>
                                    )}
                                </For>
                            </td>
                            <td class={`${getRatingClass(rating)} text-right`}>
                                {formatPercentage(ratingToWinrate(rating))}
                            </td>
                            <td class={"text-neutral-500 text-right pr-3"}>
                                {formatPercentage(games / totalOrderGames())}
                            </td>
                        </tr>
                    )}
                </VerticalEntityStats>
            </Panel>
            <Panel class="w-full">
                <PanelHeader>Skill Order</PanelHeader>
                <table class="bg-[#141414] rounded-md">
                    <thead>
                        <tr>
                            <th class="text-center uppercase pt-3 pr-1.5 pl-3 font-normal">
                                Level
                            </th>
                            <th class="text-center uppercase pt-3 px-1.5 font-normal">
                                Q
                            </th>
                            <th class="text-center uppercase pt-3 px-1.5 font-normal">
                                W
                            </th>
                            <th class="text-center uppercase pt-3 pl-1.5 pr-3 font-normal">
                                E
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <For
                            each={partialBuildDataset()!
                                .skills.level.map((l, i) => [l, i] as const)
                                .slice(0, 5)}
                        >
                            {([data, i]) => (
                                <tr>
                                    <td class="text-center text-xl pl-3 pr-1.5 py-[0.6rem]">
                                        {i + 1}
                                    </td>
                                    <For each={["Q", "W", "E"] as const}>
                                        {(skill) => (
                                            <td
                                                class={
                                                    "text-center p-1.5 " +
                                                    (skill === "E"
                                                        ? "pr-3"
                                                        : "")
                                                }
                                                onClick={() =>
                                                    setSelectedEntity({
                                                        type: "skills",
                                                        skillsType: "level",
                                                        level: i,
                                                        id: skill,
                                                    })
                                                }
                                            >
                                                <div class="flex flex-col gap-1 items-center">
                                                    <span
                                                        class={`${getRatingClass(
                                                            buildAnalysisResult()!
                                                                .skills.levels[
                                                                i
                                                            ][skill]
                                                                .totalRating,
                                                        )} text-right ${
                                                            data[skill].games /
                                                                totalGamesByLevel()[
                                                                    i
                                                                ] >
                                                            0.05
                                                                ? ""
                                                                : "opacity-20"
                                                        }`}
                                                    >
                                                        {formatPercentage(
                                                            ratingToWinrate(
                                                                buildAnalysisResult()!
                                                                    .skills
                                                                    .levels[i][
                                                                    skill
                                                                ].totalRating,
                                                            ),
                                                        )}
                                                    </span>
                                                    <span
                                                        class={
                                                            "text-neutral-500 text-right"
                                                        }
                                                    >
                                                        {formatPercentage(
                                                            data[skill].games /
                                                                totalGamesByLevel()[
                                                                    i
                                                                ],
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                        )}
                                    </For>
                                </tr>
                            )}
                        </For>
                    </tbody>
                </table>
            </Panel>
        </div>
    );
}
