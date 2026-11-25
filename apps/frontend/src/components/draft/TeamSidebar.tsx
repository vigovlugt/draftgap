import { For } from "solid-js";
import { ratingToWinrate } from "@draftgap/core/src/rating/ratings";
import { CountUp } from "../CountUp";
import { DamageDistributionBar } from "./DamageDistributionBar";
import { Pick } from "./Pick";
import { TeamOptions, TeamOptionsContextMenuContent } from "./TeamOptions";
import { ContextMenu, ContextMenuTrigger } from "../common/ContextMenu";
import { BanRow } from "./BanRow";
import { tooltip } from "../../directives/tooltip";
import { capitalize } from "../../utils/strings";
import { getRatingClass } from "../../utils/rating";
import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { cn } from "../../utils/style";
// eslint-disable-next-line
tooltip;

interface IProps {
    team: "ally" | "opponent";
}

export function TeamSidebar(props: IProps) {
    const {
        allyDraftAnalysis: allyDraftResult,
        opponentDraftAnalysis: opponentDraftResult,
        allyDamageDistribution,
        opponentDamageDistribution,
    } = useDraftAnalysis();

    const hasDamageDistribution = () => {
        const distribution =
            props.team === "ally"
                ? allyDamageDistribution()
                : opponentDamageDistribution();
        return (
            !!distribution &&
            distribution.magic + distribution.physical + distribution.true > 0
        );
    };

    const rating = () =>
        props.team === "ally"
            ? allyDraftResult()?.totalRating
            : opponentDraftResult()?.totalRating;

    return (
        <div
            class="bg-primary flex flex-col h-full relative border-neutral-700"
            classList={{
                "border-r": props.team === "ally",
                "border-l": props.team === "opponent",
            }}
        >
            <DamageDistributionBar team={props.team} />
            <ContextMenu>
                <ContextMenuTrigger
                    as="div"
                    class="peer/header flex-1 flex justify-center items-center bg-[#141414]"
                >
                    <span
                        class="text-[2.5rem] text-center leading-tight"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>{capitalize(props.team)} estimated winrate</>
                            ),
                        }}
                    >
                        {props.team.toUpperCase()}
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
                </ContextMenuTrigger>
                <TeamOptionsContextMenuContent team={props.team} />
            </ContextMenu>
            <For each={[0, 1, 2, 3, 4]}>
                {(index) => <Pick team={props.team} index={index} />}
            </For>
            <div class="shrink-0 flex items-center justify-center gap-2 px-2 py-2 border-t border-neutral-700">
                <span class="uppercase text-lg leading-none text-neutral-400">
                    Bans
                </span>
                <BanRow team={props.team} class="min-w-0" />
            </div>
            <TeamOptions
                team={props.team}
                class={cn(
                    "transition-opacity [@media(hover:hover)]:opacity-0 peer-hover/header:opacity-100 hover:opacity-100 has-focus-visible:opacity-100 has-data-expanded:opacity-100",
                    hasDamageDistribution() && "top-1",
                )}
            />
        </div>
    );
}
