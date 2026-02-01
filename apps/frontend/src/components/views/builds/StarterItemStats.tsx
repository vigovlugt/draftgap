import { Component, For, Show } from "solid-js";
import { Panel, PanelHeader } from "../../common/Panel";
import { HorizontalEntityStats } from "./EntityStats";
import { useBuild } from "../../../contexts/BuildContext";
import { ratingToWinrate } from "@draftgap/core/src/rating/ratings";
import { getRatingClass, formatPercentage } from "../../../utils/rating";
import { useDataset } from "../../../contexts/DatasetContext";

export const StarterItemStats: Component = () => {
    const { buildAnalysisResult, partialBuildDataset } = useBuild();

    return (
        <Panel>
            <PanelHeader>Starting Items</PanelHeader>
            <HorizontalEntityStats
                data={Object.keys(
                    buildAnalysisResult()!.items.startingSets,
                ).filter(
                    (id) =>
                        partialBuildDataset()!.items.startingSets[id].games /
                            partialBuildDataset()!.games >
                        0.01,
                )}
                getGames={(id) =>
                    partialBuildDataset()!.items.startingSets[id].games
                }
                getRating={(id) =>
                    buildAnalysisResult()!.items.startingSets[id].totalRating
                }
            >
                {([id]) => <StarterItem setId={id} />}
            </HorizontalEntityStats>
        </Panel>
    );
};

const StarterItem: Component<{ setId: string }> = (props) => {
    const { dataset } = useDataset();
    const { partialBuildDataset, buildAnalysisResult, setSelectedEntity } =
        useBuild();

    const result = () => buildAnalysisResult()!.items.startingSets[props.setId];
    const data = () => partialBuildDataset()!.items.startingSets[props.setId];

    const items = () =>
        props.setId
            .split("_")
            .map((id) => parseInt(id))
            .reduce(
                (acc, id) => {
                    if (acc[id] !== undefined) {
                        acc[id] += 1;
                    } else {
                        acc[id] = 1;
                    }

                    return acc;
                },
                {} as Record<number, number>,
            );

    return (
        <button
            class="flex flex-col shrink-0 gap-1 text-sm items-center justify-between"
            classList={{
                "opacity-20":
                    data().games / partialBuildDataset()!.games < 0.01,
            }}
            onClick={() =>
                setSelectedEntity({
                    type: "item",
                    itemType: "startingSets",
                    id: props.setId,
                })
            }
        >
            <div class="flex flex-col gap-1">
                <For
                    each={Object.entries(items()).sort(
                        ([a], [b]) =>
                            dataset()!.itemData[Number(b)].gold -
                            dataset()!.itemData[Number(a)].gold,
                    )}
                >
                    {([id, number]) => (
                        <div class="relative">
                            <img
                                src={`https://ddragon.leagueoflegends.com/cdn/${
                                    dataset()!.version
                                }/img/item/${id}.png`}
                                class="w-12 h-12 rounded-sm"
                            />

                            <Show when={number > 1}>
                                <div class="absolute text-sm -bottom-1 -right-1 leading-none p-1 rounded-full bg-neutral-700 w-[22px]">
                                    {number}
                                </div>
                            </Show>
                        </div>
                    )}
                </For>
            </div>
            <div>
                <div class={`${getRatingClass(result().totalRating)}`}>
                    {formatPercentage(ratingToWinrate(result().totalRating))}
                </div>
                <div class={"text-neutral-500"}>
                    {formatPercentage(
                        data().games / partialBuildDataset()!.games,
                    )}
                </div>
            </div>
        </button>
    );
};
