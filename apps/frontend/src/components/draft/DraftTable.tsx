import {
    CellContext,
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    Row,
    SortingState,
} from "@tanstack/solid-table";
import { DraftResult } from "@draftgap/core/src/draft/analysis";
import {
    analyzeDraftExtra,
    DraftExtraAnalysis,
} from "@draftgap/core/src/draft/extra-analysis";
import { useDraft } from "../../contexts/DraftContext";
import { Role } from "@draftgap/core/src/models/Role";
import { Suggestion } from "@draftgap/core/src/draft/suggestions";
import { Table } from "../common/Table";
import ChampionCell from "../common/ChampionCell";
import { RoleCell } from "../common/RoleCell";
import {
    createEffect,
    createSignal,
    For,
    onCleanup,
    onMount,
    Show,
} from "solid-js";
import { Icon } from "solid-heroicons";
import { star } from "solid-heroicons/solid";
import { star as starOutline } from "solid-heroicons/outline";
import { RatingText } from "../common/RatingText";
import { createMustSelectToast } from "../../utils/toast";
import { useUser } from "../../contexts/UserContext";
import { useDraftSuggestions } from "../../contexts/DraftSuggestionsContext";
import { useDataset } from "../../contexts/DatasetContext";
import { useDraftFilters } from "../../contexts/DraftFiltersContext";
import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import {
    informationCircle,
    presentationChartLine,
} from "solid-heroicons/solid-mini";
import { Dialog } from "../common/Dialog";
import { ChampionDraftAnalysisDialog } from "../dialogs/ChampionDraftAnalysisDialog";
import { Team } from "@draftgap/core/src/models/Team";
import { championName, roleName, t, teamName } from "../../utils/i18n";
import { Button } from "../common/Button";

type PendingPick = {
    team: Team;
    index: number;
    suggestion: Suggestion;
};

type AnalysisPick = {
    team: Team;
    championKey: string;
    draftResult?: DraftResult;
    teamComp?: Map<Role, string>;
    allyRatingByTime?: DraftExtraAnalysis["ratingByTime"];
    opponentRatingByTime?: DraftExtraAnalysis["ratingByTime"];
};

function DraftPickConfirmation(props: {
    pendingPick: PendingPick;
    onConfirm: () => void;
    onCancel: () => void;
    onOpenDetails: () => void;
}) {
    const { config } = useUser();
    const [showAnalysis, setShowAnalysis] = createSignal(false);

    const suggestion = () => props.pendingPick.suggestion;
    const draftResult = () => suggestion().draftResult;

    const summaryItems = () => [
        {
            label: t(config, "winrate"),
            rating: draftResult().totalRating,
        },
        {
            label: t(config, "champions"),
            rating: draftResult().allyChampionRating.totalRating,
        },
        {
            label: t(config, "matchups"),
            rating: draftResult().matchupRating.totalRating,
        },
        {
            label: t(config, "duos"),
            rating: draftResult().allyDuoRating.totalRating,
        },
    ];

    return (
        <div class="rounded-md border border-white/10 bg-primary shadow-lg">
            <div class="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                    <div class="text-xs uppercase text-neutral-500 sm:text-sm">
                        {t(config, "confirmPickFor", {
                            team: teamName(config, props.pendingPick.team),
                            number: props.pendingPick.index + 1,
                        })}
                    </div>
                    <div class="mt-1 flex min-w-0 items-center gap-3 text-base uppercase sm:text-lg">
                        <ChampionCell
                            championKey={suggestion().championKey}
                            nameMaxLength={14}
                        />
                        <span class="text-neutral-500">
                            {roleName(config, suggestion().role)}
                        </span>
                    </div>
                </div>
                <div class="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                        type="button"
                        class="px-3 py-1.5 text-sm uppercase text-neutral-300 transition-colors hover:text-white sm:text-base"
                        onClick={() => setShowAnalysis(!showAnalysis())}
                    >
                        {showAnalysis()
                            ? t(config, "hideAnalysis")
                            : t(config, "showAnalysis")}
                    </button>
                    <Button
                        variant="secondary"
                        class="gap-2 text-base sm:text-lg"
                        onClick={props.onOpenDetails}
                    >
                        <Icon path={presentationChartLine} class="h-5 w-5" />
                        {t(config, "fullDetails")}
                    </Button>
                    <Button
                        variant="secondary"
                        class="text-base sm:text-lg"
                        onClick={props.onCancel}
                    >
                        {t(config, "cancel")}
                    </Button>
                    <Button
                        class="text-base sm:text-lg"
                        onClick={props.onConfirm}
                    >
                        {t(config, "confirm")}
                    </Button>
                </div>
            </div>
            <Show when={showAnalysis()}>
                <div class="max-h-56 overflow-y-auto border-t border-neutral-800 p-3">
                    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <For each={summaryItems()}>
                            {(item) => (
                                <div class="rounded-md bg-[#101010] px-3 py-2">
                                    <div class="text-xs uppercase text-neutral-500 sm:text-sm">
                                        {item.label}
                                    </div>
                                    <div class="mt-1 text-xl leading-none sm:text-2xl">
                                        <RatingText rating={item.rating} />
                                    </div>
                                </div>
                            )}
                        </For>
                    </div>
                </div>
            </Show>
        </div>
    );
}

export default function DraftTable() {
    const { dataset, dataset30Days } = useDataset();
    const {
        selection,
        pickChampion,
        select,
        bans,
        ownedChampions,
    } = useDraft();
    const {
        search,
        roleFilter,
        setRoleFilter,
        favouriteFilter,
        setFavouriteFilter,
    } = useDraftFilters();
    const { allySuggestions, opponentSuggestions } = useDraftSuggestions();
    const { allyTeamComp, opponentTeamComp, draftAnalysisConfig } =
        useDraftAnalysis();
    const { isFavourite, setFavourite, config } = useUser();

    const suggestions = () =>
        selection.team === "opponent"
            ? opponentSuggestions()
            : allySuggestions();

    const ownsChampion = (championKey: string) =>
        // If we don't have owned champions, we are not logged in, so we own all champions.
        ownedChampions().size === 0 || ownedChampions().has(championKey);

    const filteredSuggestions = () => {
        let filtered = suggestions();
        if (!dataset()) {
            return filtered;
        }

        if (search()) {
            const str = search()
                .replaceAll(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "")
                .toLowerCase();
            filtered = filtered.filter((s) => {
                const champion = dataset()!.championData[s.championKey];
                return (
                    champion.name
                        .replaceAll(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "")
                        .toLowerCase()
                        .includes(str) ||
                    championName(champion, config)
                        .replaceAll(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "")
                        .toLowerCase()
                        .includes(str)
                );
            });
        }

        if (roleFilter() !== undefined) {
            filtered = filtered.filter((s) => s.role === roleFilter());
        }

        if (favouriteFilter()) {
            filtered = filtered.filter((s) =>
                isFavourite(s.championKey, s.role),
            );
        }

        if (config.showFavouritesAtTop) {
            // Sort is normally in place, but then tanstack table does not see the update.
            filtered = [...filtered].sort((a, b) => {
                const aFav = isFavourite(a.championKey, a.role);
                const bFav = isFavourite(b.championKey, b.role);
                if (aFav && !bFav) {
                    return -1;
                } else if (!aFav && bFav) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }

        if (config.banPlacement === "hidden") {
            filtered = filtered.filter((s) => !bans.includes(s.championKey));
        } else if (config.banPlacement === "bottom") {
            filtered = [...filtered].sort((a, b) => {
                const aBanned = bans.includes(a.championKey);
                const bBanned = bans.includes(b.championKey);
                if (aBanned && !bBanned) {
                    return 1;
                } else if (!aBanned && bBanned) {
                    return -1;
                } else {
                    return 0;
                }
            });
        }

        if (config.unownedPlacement === "hidden") {
            filtered = filtered.filter((s) => ownsChampion(s.championKey));
        } else if (config.unownedPlacement === "bottom") {
            filtered = [...filtered].sort((a, b) => {
                const aUnowned = !ownsChampion(a.championKey);
                const bUnowned = !ownsChampion(b.championKey);
                if (aUnowned && !bUnowned) {
                    return 1;
                } else if (!aUnowned && bUnowned) {
                    return -1;
                } else {
                    return 0;
                }
            });
        }

        return filtered;
    };

    const [analysisPick, _setAnalysisPick] = createSignal<AnalysisPick>();
    const [showAnalysisPick, setShowAnalysisPick] = createSignal(false);
    const [pendingPick, setPendingPick] = createSignal<PendingPick>();

    createEffect(() => {
        const pending = pendingPick();
        if (
            pending &&
            (selection.team !== pending.team || selection.index !== pending.index)
        ) {
            setPendingPick(undefined);
        }
    });

    function setAnalysisPick(
        pick:
            | { team: Team; championKey: string; role: Role | undefined }
            | undefined,
    ) {
        if (!pick) {
            _setAnalysisPick(undefined);
            setShowAnalysisPick(false);
            return;
        }

        if (pick.role !== undefined) {
            const suggestion = suggestions().find(
                (s) =>
                    s.championKey === pick.championKey &&
                    s.role === pick.role,
            );

            if (suggestion && dataset() && dataset30Days()) {
                const candidateTeamComp = new Map(
                    pick.team === "ally" ? allyTeamComp() : opponentTeamComp(),
                );
                candidateTeamComp.set(pick.role, pick.championKey);

                const candidateAllyTeamComp =
                    pick.team === "ally"
                        ? candidateTeamComp
                        : allyTeamComp();
                const candidateOpponentTeamComp =
                    pick.team === "opponent"
                        ? candidateTeamComp
                        : opponentTeamComp();

                _setAnalysisPick({
                    team: pick.team,
                    championKey: pick.championKey,
                    draftResult: suggestion.draftResult,
                    teamComp: candidateTeamComp,
                    allyRatingByTime: analyzeDraftExtra(
                        dataset()!,
                        dataset30Days()!,
                        candidateAllyTeamComp,
                        candidateOpponentTeamComp,
                        draftAnalysisConfig(),
                    ).ratingByTime,
                    opponentRatingByTime: analyzeDraftExtra(
                        dataset()!,
                        dataset30Days()!,
                        candidateOpponentTeamComp,
                        candidateAllyTeamComp,
                        draftAnalysisConfig(),
                    ).ratingByTime,
                });
                setShowAnalysisPick(true);
                return;
            }
        }

        _setAnalysisPick(pick);
        setShowAnalysisPick(true);
    }

    const columns: () => ColumnDef<Suggestion>[] = () => [
        {
            id: "favourite",
            header: () => (
                <button
                    class="inline-flex group"
                    onClick={() => setFavouriteFilter(!favouriteFilter())}
                >
                    <Icon
                        path={star}
                        class="w-6 inline group-hover:opacity-80 transition duration-200 ease-out"
                        classList={{
                            "opacity-50": !favouriteFilter(),
                            "opacity-100!": favouriteFilter(),
                        }}
                    />
                </button>
            ),
            accessorFn: (suggestion) => suggestion,
            cell: (info) => (
                <div class="flex items-center justify-center">
                    <Show
                        when={isFavourite(
                            info.row.original.championKey,
                            info.row.original.role,
                        )}
                        fallback={
                            <Icon
                                path={starOutline}
                                class="w-6 opacity-0 group-hover/row:opacity-50 transition duration-200 ease-out group-hover/cell:opacity-80!"
                            />
                        }
                    >
                        <Icon
                            path={star}
                            class="w-6 opacity-50 group-hover/cell:opacity-80 transition duration-200 ease-out"
                        />
                    </Show>
                </div>
            ),

            meta: {
                headerClass: "w-1",
                onClickCell: (
                    e: MouseEvent,
                    info: CellContext<Suggestion, unknown>,
                ) => {
                    e.stopPropagation();
                    setFavourite(
                        info.row.original.championKey,
                        info.row.original.role,
                        !isFavourite(
                            info.row.original.championKey,
                            info.row.original.role,
                        ),
                    );
                },
            },
            enableSorting: false,
        },
        {
            header: t(config, "role"),
            accessorFn: (suggestion) => suggestion.role,
            cell: (info) => <RoleCell role={info.getValue<Role>()} />,
            meta: {
                headerClass: "w-1",
            },
            sortDescFirst: false,
        },
        {
            header: t(config, "champion"),
            accessorFn: (suggestion) => suggestion.championKey,
            cell: (info) => (
                <ChampionCell championKey={info.getValue<string>()} />
            ),
            sortingFn: (a, b, id) =>
                dataset()!.championData[
                    a.getValue<string>(id)
                ].name.localeCompare(
                    dataset()!.championData[b.getValue<string>(id)].name,
                ),
        },
        ...(config.showAdvancedWinrates
            ? ([
                  {
                      header: t(config, "champions"),
                      accessorFn: (suggestion) =>
                          suggestion.draftResult.allyChampionRating.totalRating,
                      cell: (info) => (
                          <div class="flex justify-end">
                              <RatingText rating={info.getValue<number>()} />
                          </div>
                      ),
                  },
                  {
                      header: t(config, "matchups"),
                      accessorFn: (suggestion) =>
                          suggestion.draftResult.matchupRating.totalRating,
                      cell: (info) => (
                          <div class="flex justify-end">
                              <RatingText rating={info.getValue<number>()} />
                          </div>
                      ),
                  },
                  {
                      header: t(config, "duos"),
                      accessorFn: (suggestion) =>
                          suggestion.draftResult.allyDuoRating.totalRating,
                      cell: (info) => (
                          <div class="flex justify-end">
                              <RatingText rating={info.getValue<number>()} />
                          </div>
                      ),
                  },
              ] as ColumnDef<Suggestion>[])
            : []),
        {
            header: t(config, "winrate"),
            accessorFn: (suggestion) => suggestion.draftResult.totalRating,
            cell: (info) => (
                <div class="flex justify-end">
                    <RatingText rating={info.getValue<number>()} />
                </div>
            ),
        },
        {
            id: "actions",
            cell: (info) => (
                <button
                    tabIndex={-1}
                    onClick={(e) => {
                        e.stopPropagation();
                        setAnalysisPick({
                            team: selection.team!,
                            championKey: info.row.original.championKey,
                            role: info.row.original.role,
                        });
                    }}
                    class="py-2"
                >
                    <Icon
                        path={informationCircle}
                        class="w-5 h-5 opacity-40 hover:opacity-80 transition duration-150 ease-in-out"
                    />
                </button>
            ),
        },
    ];

    const [sorting, setSorting] = createSignal<SortingState>([]);
    const table = createSolidTable({
        get data() {
            return filteredSuggestions();
        },
        get columns() {
            return columns();
        },
        state: {
            get sorting() {
                return sorting();
            },
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    function pick(row: Row<Suggestion>) {
        if (!selection.team) {
            createMustSelectToast(config);
            return;
        }

        setPendingPick({
            team: selection.team,
            index: selection.index,
            suggestion: row.original,
        });
    }

    function confirmPendingPick() {
        const pending = pendingPick();
        if (!pending) return;

        pickChampion(
            pending.team,
            pending.index,
            pending.suggestion.championKey,
            pending.suggestion.role,
        );
        setPendingPick(undefined);

        document.getElementById("draftTableSearch")?.focus();
    }

    onMount(() => {
        const draftTable = document.getElementById("draft-table");

        const onKeyDown = (e: KeyboardEvent) => {
            const activeElement = document.activeElement;
            if (
                activeElement?.tagName === "INPUT" &&
                e.key !== "ArrowUp" &&
                e.key !== "ArrowDown"
            ) {
                return;
            }

            const selectFirstRow = () => {
                (
                    draftTable!.querySelector("tbody tr") as HTMLTableRowElement
                )?.focus();
            };

            if (e.key === "ArrowLeft" || e.key === "h") {
                e.preventDefault();
                select("ally");
            } else if (e.key === "ArrowRight" || e.key === "l") {
                e.preventDefault();
                select("opponent");
            } else if (e.key === "ArrowUp" || e.key === "k") {
                e.preventDefault();
                if (!activeElement || activeElement.tagName !== "TR") {
                    selectFirstRow();
                    return;
                }
                const previous =
                    activeElement.previousSibling as HTMLTableRowElement;
                if (previous.tagName === "TR") {
                    previous.focus();
                }
            } else if (e.key === "ArrowDown" || e.key === "j") {
                e.preventDefault();
                if (!activeElement || activeElement.tagName !== "TR") {
                    selectFirstRow();
                    return;
                }
                const next = activeElement.nextSibling as HTMLTableRowElement;
                if (next.tagName === "TR") {
                    next.focus();
                }
            }
        };
        window.addEventListener("keydown", onKeyDown);
        onCleanup(() => {
            window.removeEventListener("keydown", onKeyDown);
        });
    });

    return (
        <>
            <div class="flex min-h-0 flex-1 flex-col gap-3">
                <Table
                    table={table}
                    onClickRow={pick}
                    rowClassName={(r) =>
                        bans.find((b) => b === r.original.championKey) ||
                        !ownsChampion(r.original.championKey)
                            ? "opacity-30"
                            : pendingPick()?.suggestion.championKey ===
                                    r.original.championKey &&
                                pendingPick()?.suggestion.role ===
                                    r.original.role
                              ? "bg-neutral-800"
                              : ""
                    }
                    id="draft-table"
                    class="min-h-0 flex-1"
                />
                <Show when={pendingPick()}>
                    {(pending) => (
                        <DraftPickConfirmation
                            pendingPick={pending()}
                            onConfirm={confirmPendingPick}
                            onCancel={() => setPendingPick(undefined)}
                            onOpenDetails={() =>
                                setAnalysisPick({
                                    team: pending().team,
                                    championKey:
                                        pending().suggestion.championKey,
                                    role: pending().suggestion.role,
                                })
                            }
                        />
                    )}
                </Show>
            </div>
            <Show when={showAnalysisPick() && analysisPick()}>
                {(pick) => (
                    <Dialog
                        open={showAnalysisPick()}
                        onOpenChange={(open) => {
                            if (!open) setAnalysisPick(undefined);
                        }}
                    >
                        <ChampionDraftAnalysisDialog
                            championKey={pick().championKey}
                            team={pick().team}
                            draftResult={pick().draftResult}
                            teamComp={pick().teamComp}
                            allyRatingByTime={pick().allyRatingByTime}
                            opponentRatingByTime={
                                pick().opponentRatingByTime
                            }
                            openChampionDraftAnalysisModal={(
                                team,
                                championKey,
                            ) =>
                                setAnalysisPick({
                                    team,
                                    championKey,
                                    role: undefined,
                                })
                            }
                        />
                    </Dialog>
                )}
            </Show>
        </>
    );
}
