import { Icon } from "solid-heroicons";
import {
    arrowsRightLeft,
    users,
    user,
    presentationChartLine,
} from "solid-heroicons/solid";
import { JSX } from "solid-js/jsx-runtime";
import { Team } from "@draftgap/core/src/models/Team";
import { DraftResult } from "@draftgap/core/src/draft/analysis";
import { tooltip } from "../../../directives/tooltip";
import { RatingText } from "../../common/RatingText";
import { Component, Show } from "solid-js";
import { capitalize } from "../../../utils/strings";
import { useDraftAnalysis } from "../../../contexts/DraftAnalysisContext";
import { useDataset } from "../../../contexts/DatasetContext";
import { cn } from "../../../utils/style";
import { useUser } from "../../../contexts/UserContext";
import { t, teamName } from "../../../utils/i18n";
// eslint-disable-next-line
tooltip;

export const SummaryCard = (
    props: {
        team?: Team;
        title: string;
        icon: {
            path: JSX.Element;
            outline: boolean;
            mini: boolean;
        };
        rating?: number;
        number?: number;
        href?: string;
        tooltip: JSX.Element;
    } & JSX.HTMLAttributes<HTMLDivElement>,
) => {
    const colorClasses = () => {
        if (!props.team) return "bg-[#101010]";

        return props.team === "ally" ? "bg-[#3c82f6]" : "bg-opponent";
    };

    return (
        <a
            {...props}
            class={cn(
                "px-3 py-4 flex gap-3 items-center text-left sm:px-4 sm:py-5 sm:gap-4",
                props.class,
            )}
            // @ts-ignore
            use:tooltip={{
                content: props.tooltip,
            }}
        >
            <div
                class={`rounded-full h-10 w-10 flex shrink-0 items-center justify-center sm:h-[48px] sm:w-[48px] ${colorClasses()}`}
            >
                <Icon path={props.icon} class="w-5 sm:w-6" />
            </div>
            <div>
                <div class="text-base text-neutral-400 uppercase sm:text-lg">
                    {props.title}
                </div>
                <div class="flex items-baseline justify-between md:block lg:flex -mt-1">
                    <div class="flex items-baseline text-2xl sm:text-3xl">
                        <Show
                            when={props.rating !== undefined}
                            fallback={props.number}
                        >
                            <RatingText rating={props.rating!} />
                        </Show>
                    </div>
                </div>
            </div>
        </a>
    );
};

export const DraftSummaryCards = (
    props: { team: Team } & JSX.HTMLAttributes<HTMLDivElement>,
) => {
    const { allyDraftAnalysis, opponentDraftAnalysis } = useDraftAnalysis();
    const { config } = useUser();

    const draftResult = () =>
        props.team === "ally" ? allyDraftAnalysis()! : opponentDraftAnalysis()!;

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div
            {...props}
            class={cn(
                "grid divide-neutral-700 overflow-hidden rounded-lg bg-primary grid-cols-2 md:grid-cols-4 md:divide-x",
                props.class,
            )}
        >
            <SummaryCard
                team={props.team}
                icon={user}
                title={t(config, "champions")}
                rating={draftResult().allyChampionRating.totalRating}
                href="#champions-result"
                tooltip={
                    <>
                        {teamName(config, props.team)} estimated winrate when
                        only taking into account {teamName(config, props.team)}{" "}
                        champions
                    </>
                }
            />
            <SummaryCard
                team={props.team}
                icon={arrowsRightLeft}
                title={t(config, "matchups")}
                rating={draftResult().matchupRating.totalRating}
                href="#matchup-result"
                tooltip={
                    <>
                        {capitalize(props.team)} estimated winrate when only
                        taking into account matchups between the two teams
                    </>
                }
            />
            <SummaryCard
                team={props.team}
                icon={users}
                title={t(config, "duos")}
                rating={draftResult().allyDuoRating.totalRating}
                href="#duo-result"
                tooltip={
                    <>
                        {capitalize(props.team)} estimated winrate when only
                        taking into account {props.team} duos
                    </>
                }
            />
            <SummaryCard
                team={props.team}
                icon={presentationChartLine}
                title={t(config, "winrate")}
                rating={draftResult().totalRating}
                href="#total-result"
                tooltip={
                    <>
                        {capitalize(props.team)} estimated winrate, taking into
                        account all factors: ally champions and duos, as well as
                        opponent champions and duos and all matchups
                    </>
                }
            />
        </div>
    );
};

type ChampionSummaryCardProps = {
    championKey: string;
    team: Team;
    draftResult?: DraftResult;
} & JSX.HTMLAttributes<HTMLDivElement>;

export const ChampionSummaryCards: Component<ChampionSummaryCardProps> = (
    props,
) => {
    const { dataset } = useDataset();
    const { allyDraftAnalysis, opponentDraftAnalysis } = useDraftAnalysis();
    const { config } = useUser();

    const draftResult = () =>
        props.draftResult ??
        (props.team === "ally" ? allyDraftAnalysis()! : opponentDraftAnalysis()!);

    const name = () => dataset()!.championData[props.championKey].name;

    const baseChampionRating = () =>
        draftResult().allyChampionRating.championResults.find(
            (r) => r.championKey === props.championKey,
        )?.rating ?? 0;

    const duoRating = () =>
        draftResult()
            .allyDuoRating.duoResults.filter(
                (r) =>
                    r.championKeyA === props.championKey ||
                    r.championKeyB === props.championKey,
            )
            .reduce((acc, r) => acc + r.rating / 2, 0);

    const matchupRating = () =>
        draftResult()
            .matchupRating.matchupResults.filter(
                (r) =>
                    r.championKeyA === props.championKey ||
                    r.championKeyB === props.championKey,
            )
            .reduce((acc, r) => acc + r.rating, 0);

    const totalRating = () =>
        baseChampionRating() + duoRating() + matchupRating();

    return (
        <div
            {...props}
            class={cn(
                "grid overflow-hidden rounded-lg bg-primary grid-cols-2 sm:grid-cols-4",
                props.class,
            )}
        >
            <SummaryCard
                class="py-2!"
                icon={user}
                title={t(config, "champion")}
                rating={baseChampionRating()}
                tooltip={<>{capitalize(name())} base winrate</>}
            />
            <SummaryCard
                class="py-2!"
                icon={arrowsRightLeft}
                title={t(config, "matchups")}
                rating={matchupRating()}
                href="#matchup-champion-result"
                tooltip={
                    <>
                        {capitalize(name())} estimated winrate when taking into
                        account all {name()} matchups with opponent champions
                    </>
                }
            />
            <SummaryCard
                class="py-2!"
                icon={users}
                title={t(config, "duos")}
                rating={duoRating()}
                href="#duo-champion-result"
                tooltip={
                    <>
                        {capitalize(name())} estimated winrate when taking into
                        account all {name()} duos with ally champions
                    </>
                }
            />
            <SummaryCard
                class="py-2!"
                icon={presentationChartLine}
                title={t(config, "winrate")}
                rating={totalRating()}
                tooltip={
                    <>
                        {capitalize(name())} contribution to winrate in draft,
                        taking into account: {name()} base winrate, {name()}{" "}
                        duos, and {name()} matchups
                    </>
                }
            />
        </div>
    );
};
