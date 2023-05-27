import { createEffect, For } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { ratingToWinrate } from "../../lib/rating/ratings";
import { CountUp } from "../CountUp";
import { DamageDistributionBar } from "./DamageDistributionBar";
import { Pick } from "./Pick";
import { TeamOptions } from "./TeamOptions";
import { tooltip } from "../../directives/tooltip";
import { capitalize } from "../../utils/strings";
import { getRatingClass } from "../../utils/rating";
tooltip;

interface IProps {
    team: "ally" | "opponent";
}

export function TeamSidebar({ team }: IProps) {
    const { allyDraftResult, opponentDraftResult } = useDraft();

    const rating = () =>
        team === "ally"
            ? allyDraftResult()?.totalRating
            : opponentDraftResult()?.totalRating;

    return (
        <div class="bg-primary flex flex-col h-full relative">
            <DamageDistributionBar team={team} />
            <div class="flex-1 flex justify-center items-center bg-[#141414]">
                <span
                    class="text-[2.5rem] text-center leading-tight"
                    // @ts-ignore
                    use:tooltip={{
                        content: <>{capitalize(team)} estimated winrate</>,
                    }}
                >
                    {team.toUpperCase()}
                    <br />
                    <CountUp
                        value={rating() ? ratingToWinrate(rating()!) : 0.5}
                        formatFn={(value) => (value * 100).toFixed(2)}
                        class={`${getRatingClass(
                            rating() ?? 0
                        )} transition-colors duration-500`}
                        style={{
                            "font-variant-numeric": "tabular-nums",
                        }}
                    />
                </span>
            </div>
            <For each={[0, 1, 2, 3, 4]}>
                {(index) => <Pick team={team} index={index} />}
            </For>
            <TeamOptions team={team} />
        </div>
    );
}
