import { DraftResult } from "@draftgap/core/src/draft/analysis";
import { DraftExtraAnalysis } from "@draftgap/core/src/draft/extra-analysis";
import { Role } from "@draftgap/core/src/models/Role";
import { Team } from "@draftgap/core/src/models/Team";
import { ratingToWinrate } from "@draftgap/core/src/rating/ratings";
import { ChartConfiguration } from "chart.js";
import { Icon } from "solid-heroicons";
import { chevronDown, chevronUp } from "solid-heroicons/solid-mini";
import { createMemo, createSignal, Show } from "solid-js";
import { ChampionIcon } from "../icons/ChampionIcon";
import { MatchupResultTable } from "../views/analysis/MatchupResultTable";
import { ChampionSummaryCards } from "../views/analysis/SummaryCards";
import { tooltip } from "../../directives/tooltip";
import { DuoResultTable } from "../views/analysis/DuoResultTable";
import { buttonVariants } from "../common/Button";
import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { useDataset } from "../../contexts/DatasetContext";
import { DialogContent, DialogTitle } from "../common/Dialog";
import { cn } from "../../utils/style";
import { displayNameByStatsSite, linkByStatsSite } from "../../utils/sites";
import { useUser } from "../../contexts/UserContext";
import { championName, roleName, t, teamName } from "../../utils/i18n";
import { Chart } from "../common/Chart";
import { useExtraDraftAnalysis } from "../../contexts/ExtraDraftAnalysisContext";
// eslint-disable-next-line
tooltip;

type Props = {
    team: Team;
    championKey: string;
    openChampionDraftAnalysisModal: (team: Team, championKey: string) => void;
    draftResult?: DraftResult;
    teamComp?: Map<Role, string>;
    allyRatingByTime?: DraftExtraAnalysis["ratingByTime"];
    opponentRatingByTime?: DraftExtraAnalysis["ratingByTime"];
};

export function ChampionDraftAnalysisDialog(props: Props) {
    const { dataset } = useDataset();

    const {
        allyDraftAnalysis: allyDraftResult,
        opponentDraftAnalysis: opponentDraftResult,
        allyTeamComp,
        opponentTeamComp,
    } = useDraftAnalysis();
    const { config } = useUser();
    const [showAllMatchups, setShowAllMatchups] = createSignal(false);

    const draftResult = () =>
        props.draftResult ??
        (props.team === "ally" ? allyDraftResult() : opponentDraftResult());
    const teamComp = () =>
        props.teamComp ??
        (props.team === "ally" ? allyTeamComp() : opponentTeamComp());

    const champion = () => dataset()!.championData[props.championKey];
    const name = () => championName(champion(), config);
    const role = () =>
        [...teamComp()].find(
            ([, championKey]) => championKey === props.championKey,
        )?.[0];

    const championMatchups = createMemo(
        () =>
            draftResult()
                ?.matchupRating.matchupResults.filter(
                    (result) =>
                        result.championKeyA === props.championKey ||
                        result.championKeyB === props.championKey,
                )
                .sort((a, b) => a.roleA - b.roleA || a.roleB - b.roleB) ?? [],
    );

    const sameRoleMatchups = createMemo(() =>
        championMatchups().filter((result) => result.roleA === result.roleB),
    );

    const championDuos = createMemo(
        () =>
            draftResult()
                ?.allyDuoRating.duoResults.filter(
                    (result) =>
                        result.championKeyA === props.championKey ||
                        result.championKeyB === props.championKey,
                )
                .map((result) => {
                    if (result.championKeyA === props.championKey) {
                        return result;
                    }

                    return {
                        ...result,
                        championKeyA: result.championKeyB,
                        roleA: result.roleB,
                        championKeyB: result.championKeyA,
                        roleB: result.roleA,
                    };
                })
                .sort((a, b) => a.roleB - b.roleB) ?? [],
    );

    const onClickMatchupChampion = (team: Team, championKey: string) => {
        props.openChampionDraftAnalysisModal(
            props.team === "ally"
                ? team
                : team === "ally"
                  ? "opponent"
                  : "ally",
            championKey,
        );
    };

    return (
        <DialogContent class="max-w-3xl">
            <div class="h-24 bg-[#101010] -m-6 mb-0" />
            <div class="flex gap-4 -mt-[78px] items-center">
                <div class="rounded-full border-primary border-8">
                    <ChampionIcon
                        championKey={props.championKey}
                        size={120 / 1.1}
                        class="rounded-full!"
                    />
                </div>
                <div class="flex flex-col justify-center">
                    <DialogTitle>{name()}</DialogTitle>
                    <span class="text-lg text-neutral-300 uppercase mb-[16px] sm:text-xl">
                        {teamName(config, props.team)}{" "}
                        {roleName(config, role()!)}
                    </span>
                </div>
                <a
                    class={cn(
                        buttonVariants({ variant: "secondary" }),
                        "ml-auto mt-[64px]",
                    )}
                    href={linkByStatsSite(
                        config.defaultStatsSite,
                        champion().id,
                        role()!,
                    )}
                    target="_blank"
                >
                    {displayNameByStatsSite(config.defaultStatsSite)}
                </a>
            </div>
            <ChampionSummaryCards
                team={props.team}
                championKey={props.championKey}
                draftResult={props.draftResult}
            />

            <div
                id="matchup-champion-result"
                class="overflow-x-hidden -m-1 p-1 mt-6"
            >
                <h3
                    class="text-2xl uppercase ml-4 sm:text-3xl"
                    // @ts-ignore
                    use:tooltip={{
                        content: (
                            <>
                                {t(config, "allChampionMatchupsTooltip", {
                                    name: name(),
                                })}
                            </>
                        ),
                    }}
                >
                    {t(config, "myMatchupWinrate")}
                </h3>
                <p
                    class="text-neutral-500 uppercase mb-1 ml-4"
                    // @ts-ignore
                    use:tooltip={{
                        content: (
                            <>
                                The individual champion winrates have been
                                normalized (removed) before calculating the
                                matchup winrates.
                            </>
                        ),
                    }}
                >
                    {t(config, "championWinratesNormalized")}
                </p>
                <Show
                    when={sameRoleMatchups().length > 0}
                    fallback={
                        <p class="rounded-md bg-primary ring-1 ring-white/10 py-6 px-4 text-center uppercase text-lg text-neutral-500">
                            {t(config, "noSameRoleMatchupData")}
                        </p>
                    }
                >
                    <MatchupResultTable
                        showAll={true}
                        class="ring-1 ring-white/10"
                        data={sameRoleMatchups}
                        onClickChampion={onClickMatchupChampion}
                        truncateChampionNames
                    />
                </Show>

                <div class="flex justify-end mt-3">
                    <button
                        type="button"
                        class={cn(
                            buttonVariants({ variant: "secondary" }),
                            "gap-2 text-base sm:text-lg",
                        )}
                        onClick={() => setShowAllMatchups((value) => !value)}
                    >
                        <Icon
                            path={showAllMatchups() ? chevronUp : chevronDown}
                            class="h-5 w-5"
                        />
                        {t(
                            config,
                            showAllMatchups()
                                ? "collapseAllMatchups"
                                : "viewAllMatchups",
                        )}
                    </button>
                </div>

                <Show when={showAllMatchups()}>
                    <MatchupResultTable
                        showAll={true}
                        class="ring-1 ring-white/10 mt-3"
                        data={championMatchups}
                        onClickChampion={onClickMatchupChampion}
                        truncateChampionNames
                    />
                </Show>
            </div>

            <div
                id="duo-champion-result"
                class="overflow-x-hidden -m-1 p-1 mt-6"
            >
                <h3
                    class="text-2xl uppercase mb-1 ml-4 sm:text-3xl"
                    // @ts-ignore
                    use:tooltip={{
                        content: (
                            <>
                                {t(config, "allChampionDuosTooltip", {
                                    name: name(),
                                })}
                            </>
                        ),
                    }}
                >
                    {t(config, "myDuoWinrate")}
                </h3>
                <DuoResultTable
                    team={props.team}
                    class="ring-1 ring-white/10"
                    halfDuoRating
                    data={championDuos}
                    onClickChampion={(championKey) => {
                        props.openChampionDraftAnalysisModal(
                            props.team,
                            championKey,
                        );
                    }}
                />
            </div>

            <div class="mt-6">
                <h3 class="text-2xl uppercase ml-4 sm:text-3xl">
                    {t(config, "timeCurve")}
                </h3>
                <p class="text-neutral-500 uppercase mb-1 ml-4">
                    {t(config, "currentChampionContribution")}
                </p>
                <div class="p-4 rounded-md bg-primary h-72 ring-1 ring-white/10">
                    <ChampionTimeCurve
                        team={props.team}
                        championKey={props.championKey}
                        allyRatingByTime={props.allyRatingByTime}
                        opponentRatingByTime={props.opponentRatingByTime}
                    />
                </div>
            </div>
        </DialogContent>
    );
}

function ChampionTimeCurve(props: {
    team: Team;
    championKey: string;
    allyRatingByTime?: DraftExtraAnalysis["ratingByTime"];
    opponentRatingByTime?: DraftExtraAnalysis["ratingByTime"];
}) {
    const { allyDraftExtraAnalysis, opponentDraftExtraAnalysis } =
        useExtraDraftAnalysis();
    const { config } = useUser();

    const labels = ["0-20", "20-25", "25-30", "30-35", "35+"];
    const allyRatings = () =>
        props.allyRatingByTime ?? allyDraftExtraAnalysis()?.ratingByTime ?? [];
    const opponentRatings = () =>
        props.opponentRatingByTime ??
        opponentDraftExtraAnalysis()?.ratingByTime ??
        [];
    const selectedRatings = () =>
        props.team === "ally" ? allyRatings() : opponentRatings();
    const contributionRatings = () =>
        selectedRatings().map(
            (result) =>
                result.championResults.find(
                    (champion) => champion.championKey === props.championKey,
                )?.rating ?? 0,
        );
    const toWinrate = (rating: number) =>
        Math.round(ratingToWinrate(rating) * 10000) / 100;
    const formatContribution = (rating: number) =>
        `${rating >= 0 ? "+" : ""}${Math.round(rating)}`;

    return (
        <Chart
            chart={
                {
                    type: "bar",
                    data: {
                        labels,
                        datasets: [
                            {
                                type: "line",
                                label: teamName(config, "ally"),
                                data: allyRatings().map((result) =>
                                    toWinrate(result.totalRating),
                                ),
                                borderColor: "#3c82f6",
                                backgroundColor: "#3c82f6",
                                yAxisID: "winrate",
                            },
                            {
                                type: "line",
                                label: teamName(config, "opponent"),
                                data: opponentRatings().map((result) =>
                                    toWinrate(result.totalRating),
                                ),
                                borderColor: "#ef4444",
                                backgroundColor: "#ef4444",
                                yAxisID: "winrate",
                            },
                            {
                                type: "bar",
                                label: t(config, "currentChampionContribution"),
                                data: contributionRatings(),
                                backgroundColor: contributionRatings().map(
                                    (rating) =>
                                        rating >= 0 ? "#22c55e" : "#f97316",
                                ),
                                borderColor: "transparent",
                                yAxisID: "contribution",
                            },
                        ],
                    },
                    options: {
                        plugins: {
                            legend: {
                                labels: {
                                    boxHeight: 10,
                                },
                            },
                            tooltip: {
                                callbacks: {
                                    label(context) {
                                        const value = Number(context.raw ?? 0);

                                        if (context.datasetIndex === 2) {
                                            return `${t(
                                                config,
                                                "currentChampionContribution",
                                            )}: ${formatContribution(value)} ${t(
                                                config,
                                                "contributionRating",
                                            )}`;
                                        }

                                        return `${context.dataset.label}: ${value.toFixed(
                                            2,
                                        )}%`;
                                    },
                                },
                            },
                        },
                        borderCapStyle: "round",
                        borderWidth: 4,
                        tension: 0.1,
                        scales: {
                            winrate: {
                                type: "linear",
                                position: "left",
                                grid: {
                                    color(info) {
                                        if (info.tick.value === 50)
                                            return "#9b9b9b";

                                        return "#404040";
                                    },
                                },
                                ticks: {
                                    callback(value) {
                                        return `${value}%`;
                                    },
                                },
                            },
                            contribution: {
                                type: "linear",
                                position: "right",
                                grid: {
                                    drawOnChartArea: false,
                                },
                                ticks: {
                                    callback(value) {
                                        const rating = Number(value);
                                        return `${rating >= 0 ? "+" : ""}${rating}`;
                                    },
                                },
                            },
                        },
                    },
                } as ChartConfiguration<"bar" | "line">
            }
        />
    );
}
