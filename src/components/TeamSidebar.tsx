import { createEffect, For } from "solid-js";
import { useDraft } from "../context/DraftContext";
import { DamageDistributionBar } from "./DamageDistributionBar";
import { Pick } from "./Pick";

interface IProps {
    team: "ally" | "opponent";
}

export function TeamSidebar({ team }: IProps) {
    const { dataset, allyDraftResult, opponentDraftResult, allySuggestions } =
        useDraft();

    const winrate = () =>
        team === "ally"
            ? allyDraftResult()?.winrate
            : opponentDraftResult()?.winrate;

    createEffect(() => {
        console.log("draftresults", allyDraftResult(), opponentDraftResult());
        console.log("dataset", dataset());
    });

    return (
        <div class="bg-primary flex flex-col h-full relative">
            <DamageDistributionBar team={team} />
            <div class="flex-1 flex justify-center items-center text-5xl bg-[#101010]">
                {team.toUpperCase()} -{" "}
                {winrate()
                    ? parseFloat((winrate()! * 100).toFixed(2)).toString()
                    : "0"}
            </div>
            <For each={[0, 1, 2, 3, 4]}>
                {(index) => <Pick team={team} index={index} />}
            </For>
        </div>
    );
}
