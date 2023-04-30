import { Component, For, Show } from "solid-js";
import { Panel, PanelHeader } from "../../common/Panel";
import { HorizontalItemStats } from "./HorizontalItemStats";
import { useDraft } from "../../../context/DraftContext";
import { useBuild } from "../../../context/BuildContext";
import { ratingToWinrate } from "../../../lib/rating/ratings";
import { getRatingClass, formatPercentage } from "../../../utils/rating";

export const StarterItemStats: Component = () => {
    const { dataset } = useDraft();
    const { buildAnalysisResult, partialBuildDataset } = useBuild();

    return (
        <Panel>
            <PanelHeader>Starter Items</PanelHeader>
            <HorizontalItemStats
                items={Object.keys(buildAnalysisResult()!.items.startingSets)}
                getGames={(id) =>
                    partialBuildDataset()!.items.startingSets[id].games
                }
                getRating={(id) =>
                    buildAnalysisResult()!.items.startingSets[id].totalRating
                }
            >
                {(id) => <StarterItem setId={id} />}
            </HorizontalItemStats>
        </Panel>
    );
};

const StarterItem: Component<{ setId: string }> = (props) => {
    const { dataset } = useDraft();
    const { partialBuildDataset, buildAnalysisResult, setSelectedEntity } =
        useBuild();

    const result = () => buildAnalysisResult()!.items.startingSets[props.setId];
    const data = () => partialBuildDataset()!.items.startingSets[props.setId];

    const items = () =>
        props.setId
            .split("_")
            .map((id) => parseInt(id))
            .reduce((acc, id) => {
                if (acc[id] !== undefined) {
                    acc[id] += 1;
                } else {
                    acc[id] = 1;
                }

                return acc;
            }, {} as Record<number, number>);

    return (
        <button
            class="flex flex-col flex-shrink-0 gap-1 text-sm items-center"
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
            <div class="flex gap-1">
                <For
                    each={Object.entries(items()).sort(
                        ([a], [b]) =>
                            dataset()!.itemData[b as any].gold -
                            dataset()!.itemData[a as any].gold
                    )}
                >
                    {([id, number]) => (
                        <div class="relative">
                            <img
                                src={`https://ddragon.leagueoflegends.com/cdn/${
                                    dataset()!.version
                                }/img/item/${id}.png`}
                                class="w-12 h-12"
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
            <div class={`${getRatingClass(result().totalRating)}`}>
                {formatPercentage(ratingToWinrate(result().totalRating))}
            </div>
            <div class={"text-neutral-500"}>
                {formatPercentage(data().games / partialBuildDataset()!.games)}
            </div>
        </button>
    );
};