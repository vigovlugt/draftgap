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
import { ratingToWinrate } from "../../lib/rating/ratings";
import { formatRating } from "../../utils/rating";
import { tooltip } from "../../directives/tooltip";
tooltip;

const SummaryCard = (props: {
    title: string;
    rating: number;
    icon: {
        path: JSX.Element;
        outline: boolean;
        mini: boolean;
    };
    team: Team;
    href?: string;
    tooltip: JSX.Element;
}) => {
    const colorClasses = () =>
        props.team === "ally" ? "bg-[#3c82f6]" : "bg-[#ef4444]";

    return (
        <a
            class="px-4 py-5 flex gap-4 items-center text-left"
            href={props.href}
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
                        {formatRating(props.rating)}
                    </div>
                </div>
            </div>
        </a>
    );
};

export const SummaryCards = (
    props: { team: Team } & JSX.HTMLAttributes<HTMLDivElement>
) => {
    const { allyDraftResult, opponentDraftResult } = useDraft();

    const draftResult = () =>
        props.team === "ally" ? allyDraftResult()! : opponentDraftResult()!;

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div
            {...props}
            class={`grid divide-neutral-700 overflow-hidden rounded-lg bg-[#191919] shadow grid-cols-2 md:grid-cols-4 md:divide-x ${props.class}`}
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
