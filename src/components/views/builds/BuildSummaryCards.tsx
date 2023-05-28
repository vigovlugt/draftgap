import { Component, JSX } from "solid-js";
import { useBuild } from "../../../contexts/BuildContext";
import { SummaryCard } from "../analysis/SummaryCards";
import {
    arrowsRightLeft,
    presentationChartLine,
    user,
} from "solid-heroicons/solid";
import { capitalize } from "../../../utils/strings";
import { useDataset } from "../../../contexts/DatasetContext";

export const BuildSummaryCards: Component<
    JSX.HTMLAttributes<HTMLDivElement>
> = (props) => {
    const { dataset } = useDataset();
    const { selectedEntity, buildAnalysisResult } = useBuild();

    const title = () =>
        ({
            rune: "Rune",
            item: "Item",
        }[selectedEntity()!.type]);
    const name = () => {
        const selected = selectedEntity()!;
        switch (selected.type) {
            case "rune":
                if (selected.runeType.startsWith("shard-")) {
                    return dataset()!.statShardData[selected.id].name;
                }
                return dataset()!.runeData[selected.id].name;
            case "item":
                switch (selected.itemType) {
                    case "startingSets":
                        return "Starting Items";
                    case "sets":
                        return "Build";
                    default:
                        return dataset()!.itemData[selected.id].name;
                }
        }
    };

    const runeAnalysisResult = () => {
        const selected = selectedEntity();
        if (selected?.type !== "rune") return undefined;

        switch (selected.runeType) {
            case "primary":
                return buildAnalysisResult()?.runes.primary[selected.id];
            case "secondary":
                return buildAnalysisResult()?.runes.secondary[selected.id];
            case "shard-offense":
                return buildAnalysisResult()?.runes.shards.offense[selected.id];
            case "shard-flex":
                return buildAnalysisResult()?.runes.shards.flex[selected.id];
            case "shard-defense":
                return buildAnalysisResult()?.runes.shards.defense[selected.id];
        }
    };

    const itemAnalysisResult = () => {
        const selected = selectedEntity();
        if (selected?.type !== "item") return undefined;

        if (selected.itemType === "boots") {
            return buildAnalysisResult()!.items.boots[selected.id];
        }
        if (selected.itemType === "startingSets") {
            return buildAnalysisResult()!.items.startingSets[selected.id];
        }
        if (selected.itemType === "sets") {
            return buildAnalysisResult()!.items.sets[selected.id];
        }

        return buildAnalysisResult()!.items.statsByOrder[selected.itemType][
            selectedEntity()!.id
        ];
    };

    const baseRating = () => {
        switch (selectedEntity()!.type) {
            case "rune":
                return runeAnalysisResult()!.baseResult.rating;
            case "item":
                return itemAnalysisResult()!.baseResult.rating;
        }
    };

    const matchupRating = () => {
        switch (selectedEntity()!.type) {
            case "rune":
                return runeAnalysisResult()!.matchupResult.totalRating;
            case "item":
                return itemAnalysisResult()!.matchupResult.totalRating;
        }
    };

    const totalRating = () => {
        switch (selectedEntity()!.type) {
            case "rune":
                return runeAnalysisResult()!.totalRating;
            case "item":
                return itemAnalysisResult()!.totalRating;
        }
    };

    return (
        <div
            {...props}
            class={`grid overflow-hidden rounded-lg bg-[#191919] grid-cols-2 sm:grid-cols-3 ${props.class}`}
        >
            <SummaryCard
                class="!py-2"
                icon={user}
                title={title()}
                rating={baseRating()}
                tooltip={
                    <>
                        If above 50%, {name()} has a positive impact on the
                        winrate of this champion. If below 50%, {name()} is
                        worse than average on this champion
                    </>
                }
            />
            <SummaryCard
                class="!py-2"
                icon={arrowsRightLeft}
                title="Matchups"
                rating={matchupRating()}
                tooltip={
                    <>
                        If above 50%, {name()} performs better against opponents
                        than what is expected of {name()}. If below 50%,{" "}
                        {name()} is worse against opponents than in the average
                        game
                    </>
                }
            />
            <SummaryCard
                class="!py-2"
                icon={presentationChartLine}
                title="Total"
                rating={totalRating()}
                tooltip={
                    <>
                        {capitalize(name())} contribution to winrate of
                        champion, taking into account base winrate, and matchups
                        against opponents
                    </>
                }
            />
        </div>
    );
};
