import { Icon } from "solid-heroicons";
import {
    arrowsRightLeft,
    users,
    user,
    presentationChartLine,
} from "solid-heroicons/solid";
import { JSX } from "solid-js/jsx-runtime";
import { useDraft } from "../../context/DraftContext";
import { Team } from "../../lib/models/Team";
import { tooltip } from "../../directives/tooltip";
import { RatingText } from "../common/RatingText";
import { Component } from "solid-js";
import { capitalize } from "../../utils/strings";
tooltip;

const SummaryCard = (
    props: {
        team?: Team;
        title: string;
        rating: number;
        icon: {
            path: JSX.Element;
            outline: boolean;
            mini: boolean;
        };
        href?: string;
        tooltip: JSX.Element;
    } & JSX.HTMLAttributes<HTMLDivElement>
) => {
    const colorClasses = () => {
        if (!props.team) return "bg-[#101010]";

        return props.team === "ally" ? "bg-[#3c82f6]" : "bg-[#ef4444]";
    };

    return (
        <a
            {...props}
            class={`px-4 py-5 flex gap-4 items-center text-left ${props.class}`}
            // @ts-ignore
            use:tooltip={{
                content: props.tooltip,
                placement: "top",
            }}
        >
            <div
                class={`rounded-full h-[48px] w-[48px] flex items-center justify-center ${colorClasses()}`}
            >
                <Icon path={props.icon} class="w-6" />
            </div>
            <div>
                <div class="text-lg text-neutral-400 uppercase">
                    {props.title}
                </div>
                <div class="flex items-baseline justify-between md:block lg:flex -mt-1">
                    <div class="flex items-baseline text-3xl">
                        <RatingText rating={props.rating} />
                    </div>
                </div>
            </div>
        </a>
    );
};

export const DraftSummaryCards = (
    props: { team: Team } & JSX.HTMLAttributes<HTMLDivElement>
) => {
    const { allyDraftResult, opponentDraftResult } = useDraft();

    const draftResult = () =>
        props.team === "ally" ? allyDraftResult()! : opponentDraftResult()!;

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div
            {...props}
            class={`grid divide-neutral-700 overflow-hidden rounded-lg bg-[#191919] grid-cols-2 md:grid-cols-4 md:divide-x ${props.class}`}
        >
            <SummaryCard
                team={props.team}
                icon={user}
                title="Champions"
                rating={draftResult().allyChampionRating.totalRating}
                href="#champions-result"
                tooltip={
                    <>
                        {capitalize(props.team)} estimated winrate when only
                        taking into account {props.team} champions
                    </>
                }
            />
            <SummaryCard
                team={props.team}
                icon={arrowsRightLeft}
                title="Matchups"
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
                title="Duos"
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
                title="Winrate"
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
} & JSX.HTMLAttributes<HTMLDivElement>;

export const ChampionSummaryCards: Component<ChampionSummaryCardProps> = (
    props
) => {
    const { allyDraftResult, opponentDraftResult, dataset } = useDraft();

    const draftResult = () =>
        props.team === "ally" ? allyDraftResult()! : opponentDraftResult()!;

    const name = () => dataset()!.championData[props.championKey].name;

    const baseChampionRating = () =>
        draftResult().allyChampionRating.championResults.find(
            (r) => r.championKey === props.championKey
        )?.rating ?? 0;

    const duoRating = () =>
        draftResult()
            .allyDuoRating.duoResults.filter(
                (r) =>
                    r.championKeyA === props.championKey ||
                    r.championKeyB === props.championKey
            )
            .reduce((acc, r) => acc + r.rating / 2, 0);

    const matchupRating = () =>
        draftResult()
            .matchupRating.matchupResults.filter(
                (r) =>
                    r.championKeyA === props.championKey ||
                    r.championKeyB === props.championKey
            )
            .reduce((acc, r) => acc + r.rating, 0);

    const totalRating = () =>
        baseChampionRating() + duoRating() + matchupRating();

    return (
        <div
            {...props}
            class={`grid overflow-hidden rounded-lg bg-[#191919] grid-cols-2 sm:grid-cols-4 ${props.class}`}
        >
            <SummaryCard
                class="!py-2"
                icon={user}
                title="Champion"
                rating={baseChampionRating()}
                tooltip={<>{capitalize(name())} base winrate</>}
            />
            <SummaryCard
                class="!py-2"
                icon={arrowsRightLeft}
                title="Matchups"
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
                class="!py-2"
                icon={users}
                title="Duos"
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
                class="!py-2"
                icon={presentationChartLine}
                title="Winrate"
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
