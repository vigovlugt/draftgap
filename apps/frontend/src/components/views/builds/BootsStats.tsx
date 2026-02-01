import { Component } from "solid-js";
import { useBuild } from "../../../contexts/BuildContext";
import { Panel, PanelHeader } from "../../common/Panel";
import { formatPercentage, getRatingClass } from "../../../utils/rating";
import { ratingToWinrate } from "@draftgap/core/src/rating/ratings";
import { HorizontalEntityStats } from "./EntityStats";
import { useDataset } from "../../../contexts/DatasetContext";

export const BootsStats: Component = () => {
    const { buildAnalysisResult, partialBuildDataset } = useBuild();

    return (
        <Panel>
            <PanelHeader>Boots</PanelHeader>
            <HorizontalEntityStats
                data={Object.keys(buildAnalysisResult()!.items.boots).filter(
                    (id) =>
                        partialBuildDataset()!.items.boots[parseInt(id)].games /
                            partialBuildDataset()!.games >
                        0.01,
                )}
                getGames={(id) => partialBuildDataset()!.items.boots[id].games}
                getRating={(id) =>
                    buildAnalysisResult()!.items.boots[id].totalRating
                }
            >
                {([id]) => <Boot itemId={parseInt(id)} />}
            </HorizontalEntityStats>
        </Panel>
    );
};

const Boot: Component<{ itemId: number }> = (props) => {
    const { dataset } = useDataset();
    const { partialBuildDataset, buildAnalysisResult, setSelectedEntity } =
        useBuild();

    const result = () => buildAnalysisResult()!.items.boots[props.itemId];
    const data = () => partialBuildDataset()!.items.boots[props.itemId];

    return (
        <button
            class="flex flex-col gap-1 text-sm items-center"
            classList={{
                "opacity-20":
                    data().games / partialBuildDataset()!.games < 0.01,
            }}
            onClick={() =>
                setSelectedEntity({
                    type: "item",
                    itemType: "boots",
                    id: props.itemId,
                })
            }
        >
            <img
                src={`https://ddragon.leagueoflegends.com/cdn/${
                    dataset()!.version
                }/img/item/${props.itemId}.png`}
                class="w-12 h-12 rounded-sm"
            />
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
