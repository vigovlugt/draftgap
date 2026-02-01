import { Component } from "solid-js";
import { Panel, PanelHeader } from "../../common/Panel";
import { HorizontalEntityStats } from "./EntityStats";
import { useBuild } from "../../../contexts/BuildContext";
import { ratingToWinrate } from "@draftgap/core/src/rating/ratings";
import { useDataset } from "../../../contexts/DatasetContext";
import { getRatingClass, formatPercentage } from "../../../utils/rating";

export const SummonerSpellsStats: Component = () => {
    const { buildAnalysisResult, partialBuildDataset } = useBuild();
    return (
        <Panel>
            <PanelHeader>Summoner Spells</PanelHeader>
            <HorizontalEntityStats
                data={Object.keys(buildAnalysisResult()!.summonerSpells).filter(
                    (id) =>
                        partialBuildDataset()!.summonerSpells[id].games /
                            partialBuildDataset()!.games >
                        0.01,
                )}
                getGames={(id) =>
                    partialBuildDataset()!.summonerSpells[id].games
                }
                getRating={(id) =>
                    buildAnalysisResult()!.summonerSpells[id].totalRating
                }
            >
                {([id]) => <SummonerSpells setId={id} />}
            </HorizontalEntityStats>
        </Panel>
    );
};

const SummonerSpells: Component<{ setId: string }> = (props) => {
    const { dataset } = useDataset();
    const { partialBuildDataset, buildAnalysisResult, setSelectedEntity } =
        useBuild();

    const result = () => buildAnalysisResult()!.summonerSpells[props.setId];
    const data = () => partialBuildDataset()!.summonerSpells[props.setId];

    const spells = () =>
        props.setId
            .split("_")
            .map((id) => parseInt(id))
            .sort((a, b) => {
                // Natural number sort except 4 (flash) is before all
                if (a === 4) return -1;
                if (b === 4) return 1;
                return a - b;
            });

    return (
        <button
            class="flex flex-col shrink-0 gap-1 text-sm items-center justify-between"
            classList={{
                "opacity-20":
                    data().games / partialBuildDataset()!.games < 0.01,
            }}
            onClick={() =>
                setSelectedEntity({
                    type: "summonerSpells",
                    id: props.setId,
                })
            }
        >
            <div class="flex flex-col gap-1">
                <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${
                        dataset()!.version
                    }/img/spell/${
                        dataset()!.summonerSpellData[spells()[0]].id
                    }.png`}
                    class="w-12 h-12 rounded-sm"
                />
                <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${
                        dataset()!.version
                    }/img/spell/${
                        dataset()!.summonerSpellData[spells()[1]].id
                    }.png`}
                    class="w-12 h-12 rounded-sm"
                />
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
