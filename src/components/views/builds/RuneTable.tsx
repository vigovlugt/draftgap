import { Component, For, Show, createMemo } from "solid-js";
import { Panel, PanelHeader } from "../../common/Panel";
import { useDraft } from "../../../context/DraftContext";
import { RuneData } from "../../../lib/models/dataset/RuneData";
import { formatPercentage, getRatingClass } from "../../../utils/rating";
import { ratingToWinrate } from "../../../lib/rating/ratings";
import { useBuild } from "../../../context/BuildContext";

export const RuneTable: Component = (props) => {
    const { dataset } = useDraft();

    const paths = () =>
        Object.keys(dataset()!.runePathData).map((str) => parseInt(str));

    return (
        <Panel>
            <PanelHeader>Runes</PanelHeader>
            <div class="flex gap-4 justify-between flex-wrap mb-4 max-w-7xl">
                <For each={paths()}>
                    {(pathId) => (
                        <div class="flex flex-col gap-4">
                            <PathTable pathId={pathId} type="primary" />
                            <PathTable pathId={pathId} type="secondary" />
                        </div>
                    )}
                </For>
            </div>
        </Panel>
    );
};

type PathTableProps = {
    pathId: number;
    type: "primary" | "secondary";
};

export const PathTable: Component<PathTableProps> = (props) => {
    const { dataset } = useDraft();
    const { buildAnalysisResult, partialBuildDataset } = useBuild();

    const runes = () =>
        Object.values(dataset()!.runeData).filter(
            (r) => r.pathId === props.pathId
        );
    const runesBySlot = createMemo(() => {
        const result = new Map<number, RuneData[]>();

        for (const rune of runes()) {
            if (!result.has(rune.slot)) {
                result.set(rune.slot, []);
            }
            result.get(rune.slot)!.push(rune);
        }

        for (const slot of result.keys()) {
            result.set(
                slot,
                result.get(slot)!.sort((a, b) => a.index - b.index)
            );
        }

        return result;
    });

    const runeAnalysis = (runeId: number) =>
        buildAnalysisResult()!.runes[props.type][runeId];
    const runeStats = (runeId: number) =>
        partialBuildDataset()!.runes[props.type][runeId];

    return (
        <div class="relative isolate">
            <Show when={props.type === "primary"}>
                <h3 class="uppercase mb-2 min-w-[184px] relative">
                    {dataset()!.runePathData[props.pathId].name}
                </h3>
            </Show>
            <div class="bg-[#141414] p-2 rounded-md flex flex-col gap-2 relative">
                <Show when={props.type === "primary"}>
                    <div class="flex gap-2 justify-between mb-2 min-w-[184px]">
                        <For each={runesBySlot().get(0)}>
                            {(rune) => (
                                <Rune
                                    runeId={rune.id}
                                    rating={runeAnalysis(rune.id).totalRating}
                                    games={runeStats(rune.id).games}
                                    totalGames={partialBuildDataset()!.games}
                                    type={props.type}
                                />
                            )}
                        </For>
                    </div>
                </Show>
                <For
                    each={[...runesBySlot().keys()]
                        .filter((i) => i !== 0)
                        .sort()}
                >
                    {(slot) => (
                        <div class="flex gap-2 justify-between min-w-[184px]">
                            <For each={runesBySlot().get(slot)}>
                                {(rune) => (
                                    <Rune
                                        runeId={rune.id}
                                        rating={
                                            runeAnalysis(rune.id).totalRating
                                        }
                                        games={runeStats(rune.id).games}
                                        totalGames={
                                            partialBuildDataset()!.games
                                        }
                                        type={props.type}
                                    />
                                )}
                            </For>
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
};

type RuneProps = {
    runeId: number;
    type: "primary" | "secondary";
    rating: number;
    games: number;
    totalGames: number;
};

export const Rune: Component<RuneProps> = (props) => {
    const { dataset } = useDraft();
    const { setSelectedEntity } = useBuild();

    const rune = () => dataset()!.runeData[props.runeId];

    const imgUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${rune().icon.toLowerCase()}`;

    return (
        <button
            class="flex flex-col items-center justify-center gap-1 text-xs"
            classList={{
                "opacity-20": props.games / props.totalGames < 0.01,
            }}
            onClick={() =>
                setSelectedEntity({
                    type: "rune",
                    runeType: props.type,
                    id: props.runeId,
                })
            }
        >
            <img
                src={imgUrl}
                alt={rune().name}
                classList={{
                    "w-7 h-7": rune().slot !== 0,
                    "w-10 h-10 -mb-1": rune().slot === 0,
                }}
            />
            <span class={getRatingClass(props.rating)}>
                {formatPercentage(ratingToWinrate(props.rating))}
            </span>
            <span class="text-neutral-500">
                {formatPercentage(props.games / props.totalGames)}
            </span>
        </button>
    );
};
