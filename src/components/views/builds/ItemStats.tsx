import { Component, For } from "solid-js";
import { Panel, PanelHeader } from "../../common/Panel";
import { VerticalEntityStats } from "./EntityStats";
import { useBuild } from "../../../context/BuildContext";
import { useDraft } from "../../../context/DraftContext";
import { ratingToWinrate } from "../../../lib/rating/ratings";
import { getRatingClass, formatPercentage } from "../../../utils/rating";

const ZERO_TO_FOUR = [0, 1, 2, 3, 4] as const;

export const ItemStats: Component = () => {
    const { dataset } = useDraft();
    const { buildAnalysisResult, partialBuildDataset } = useBuild();

    const getDataForOrder = (order: number) => {
        const orderGames = Object.values(
            partialBuildDataset()!.items.statsByOrder[order]
        ).reduce((acc, item) => acc + item.games, 0);
        return Object.keys(
            buildAnalysisResult()!.items.statsByOrder[order] ?? {}
        )
            .map((id) => parseInt(id))
            .filter(
                (id) =>
                    partialBuildDataset()!.items.statsByOrder[order][id].games /
                        orderGames >
                    0.01
            );
    };

    return (
        <Panel>
            <PanelHeader>Items</PanelHeader>
            <div class="flex gap-2 flex-wrap justify-between">
                <For each={ZERO_TO_FOUR}>
                    {(i) => (
                        <div>
                            <p class="text-md uppercase font-semibold mb-1 ml-3">
                                Item {i + 1}
                            </p>
                            <VerticalEntityStats
                                data={getDataForOrder(i)}
                                getGames={(id) =>
                                    partialBuildDataset()!.items.statsByOrder[
                                        i
                                    ][id].games
                                }
                                getRating={(id) =>
                                    buildAnalysisResult()!.items.statsByOrder[
                                        i
                                    ][id].totalRating
                                }
                            >
                                {(item) => <Item order={i} itemId={item} />}
                            </VerticalEntityStats>
                        </div>
                    )}
                </For>
            </div>
        </Panel>
    );
};

const Item: Component<{ order: number; itemId: number }> = (props) => {
    const { dataset } = useDraft();
    const { partialBuildDataset, buildAnalysisResult, setSelectedEntity } =
        useBuild();

    const result = () =>
        buildAnalysisResult()!.items.statsByOrder[props.order][props.itemId];
    const data = () =>
        partialBuildDataset()!.items.statsByOrder[props.order][props.itemId];

    return (
        <tr
            class="cursor-pointer"
            onClick={() =>
                setSelectedEntity({
                    type: "item",
                    itemType: props.order,
                    id: props.itemId,
                })
            }
        >
            <td class="pl-3 py-2">
                <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${
                        dataset()!.version
                    }/img/item/${props.itemId}.png`}
                    class="w-12 h-12 rounded"
                />
            </td>
            <td class={`${getRatingClass(result().totalRating)} text-right`}>
                {formatPercentage(ratingToWinrate(result().totalRating))}
            </td>
            <td class={"text-neutral-500 text-right pr-3"}>
                {formatPercentage(data().games / partialBuildDataset()!.games)}
            </td>
        </tr>
    );
};
