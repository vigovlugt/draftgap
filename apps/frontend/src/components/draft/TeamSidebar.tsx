import { For } from "solid-js";
import { ratingToWinrate } from "@draftgap/core/src/rating/ratings";
import { CountUp } from "../CountUp";
import { DamageDistributionBar } from "./DamageDistributionBar";
import { Pick } from "./Pick";
import { TeamOptions } from "./TeamOptions";
import { tooltip } from "../../directives/tooltip";
import { getRatingClass } from "../../utils/rating";
import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { useUser } from "../../contexts/UserContext";
import { t, teamName } from "../../utils/i18n";
// eslint-disable-next-line
tooltip;

interface IProps {
    team: "ally" | "opponent";
}

export function TeamSidebar(props: IProps) {
    const {
        allyDraftAnalysis: allyDraftResult,
        opponentDraftAnalysis: opponentDraftResult,
    } = useDraftAnalysis();
    const { config } = useUser();

    const rating = () =>
        props.team === "ally"
            ? allyDraftResult()?.totalRating
            : opponentDraftResult()?.totalRating;

    return (
        <div class="bg-primary flex flex-col h-full relative">
            <DamageDistributionBar team={props.team} />
            <div class="flex-1 flex justify-center items-center bg-[#141414]">
                <span
                    class="text-[1.75rem] text-center leading-tight sm:text-[2rem] xl:text-[2.5rem]"
                    // @ts-ignore
                    use:tooltip={{
                        content:
                            props.team === "ally"
                                ? t(config, "allyEstimatedWinrate")
                                : t(config, "opponentEstimatedWinrate"),
                    }}
                >
                    {teamName(config, props.team)}
                    <br />
                    <CountUp
                        value={rating() ? ratingToWinrate(rating()!) : 0.5}
                        formatFn={(value) => (value * 100).toFixed(2)}
                        class={`${getRatingClass(
                            rating() ?? 0,
                        )} transition-colors duration-500`}
                        style={{
                            "font-variant-numeric": "tabular-nums",
                        }}
                    />
                </span>
            </div>
            <For each={[0, 1, 2, 3, 4]}>
                {(index) => <Pick team={props.team} index={index} />}
            </For>
            <TeamOptions team={props.team} />
        </div>
    );
}
