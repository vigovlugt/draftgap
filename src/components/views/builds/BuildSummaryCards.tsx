import { Component, JSX } from "solid-js";
import { useDraft } from "../../../context/DraftContext";
import { useBuild } from "../../../context/BuildContext";
import { SummaryCard } from "../analysis/SummaryCards";
import {
    arrowsRightLeft,
    presentationChartLine,
    user,
} from "solid-heroicons/solid";
import { capitalize } from "../../../utils/strings";

export const BuildSummaryCards: Component<
    JSX.HTMLAttributes<HTMLDivElement>
> = (props) => {
    const { allyDraftResult, opponentDraftResult, dataset } = useDraft();
    const { selectedEntity, buildPick, buildAnalysisResult } = useBuild();

    const title = () =>
        ({
            rune: "Rune",
        }[selectedEntity()!.type]);
    const name = () =>
        ({
            rune: dataset()!.runeData[selectedEntity()!.id].name,
        }[selectedEntity()!.type]);

    const runeAnalysisResult = () => {
        if (selectedEntity() && selectedEntity()!.type !== "rune")
            return undefined;

        return buildAnalysisResult()!.runes[selectedEntity()!.runeType][
            selectedEntity()!.id
        ];
    };

    const baseRating = () =>
        ({
            rune: runeAnalysisResult()!.runeResult.rating,
        }[selectedEntity()!.type]);

    const matchupRating = () =>
        ({
            rune: runeAnalysisResult()!.matchupResult.totalRating,
        }[selectedEntity()!.type]);

    const totalRating = () =>
        ({
            rune: runeAnalysisResult()!.totalRating,
        }[selectedEntity()!.type]);

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
