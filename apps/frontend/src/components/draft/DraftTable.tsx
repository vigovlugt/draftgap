import {
    CellContext,
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    Row,
    SortingState,
} from "@tanstack/solid-table";
import { useDraft } from "../../contexts/DraftContext";
import { Role } from "@draftgap/core/src/models/Role";
import { Suggestion } from "@draftgap/core/src/draft/suggestions";
import { Table } from "../common/Table";
import ChampionCell from "../common/ChampionCell";
import { RoleCell } from "../common/RoleCell";
import { batch, createSignal, onCleanup, onMount, Show } from "solid-js";
import { Icon } from "solid-heroicons";
import { star } from "solid-heroicons/solid";
import { star as starOutline } from "solid-heroicons/outline";
import { RatingText } from "../common/RatingText";
import { createMustSelectToast } from "../../utils/toast";
import { useUser } from "../../contexts/UserContext";
import { useDraftSuggestions } from "../../contexts/DraftSuggestionsContext";
import { useDataset } from "../../contexts/DatasetContext";
import { useDraftFilters } from "../../contexts/DraftFiltersContext";
import { informationCircle } from "solid-heroicons/solid-mini";
import { Dialog } from "../common/Dialog";
import { ChampionDraftAnalysisDialog } from "../dialogs/ChampionDraftAnalysisDialog";
import { Team } from "@draftgap/core/src/models/Team";
import { championName } from "../../utils/i18n";

export default function DraftTable() {
    const { dataset } = useDataset();
    const { selection, pickChampion, select, bans, ownedChampions } =
        useDraft();
    const {
        search,
        roleFilter,
        setRoleFilter,
        favouriteFilter,
        setFavouriteFilter,
    } = useDraftFilters();
    const { allySuggestions, opponentSuggestions } = useDraftSuggestions();
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
                isFavourite(s.championKey, s.role)
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

    const [analysisPick, _setAnalysisPick] = createSignal<{
        team: Team;
        championKey: string;
    }>();
    const [showAnalysisPick, setShowAnalysisPick] = createSignal(false);
    const [savedRoleFilter, setSavedRoleFilter] = createSignal<Role>();

    function setAnalysisPick(
        pick:
            | { team: Team; championKey: string; role: Role | undefined }
            | undefined
    ) {
        batch(() => {
            if (!pick) {
                pickChampion(
                    selection.team!,
                    selection.index,
                    undefined,
                    undefined,
                    {
                        updateSelection: false,
                        resetFilters: false,
                        reportEvent: false,
                        updateView: false,
                    }
                );
                setRoleFilter(savedRoleFilter());
                setSavedRoleFilter(undefined);
                setShowAnalysisPick(false);
                return;
            }
            if (pick.role !== undefined) {
                setSavedRoleFilter(roleFilter());
                pickChampion(
                    selection.team!,
                    selection.index,
                    pick.championKey,
                    pick.role,
                    {
                        updateSelection: false,
                        resetFilters: false,
                        reportEvent: false,
                        updateView: false,
                    }
                );
            }
            _setAnalysisPick(pick);
            setShowAnalysisPick(true);
        });
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
                            "!opacity-100": favouriteFilter(),
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
                            info.row.original.role
                        )}
                        fallback={
                            <Icon
                                path={starOutline}
                                class="w-6 opacity-0 group-hover/row:opacity-50 transition duration-200 ease-out group-hover/cell:!opacity-80"
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
                    info: CellContext<Suggestion, unknown>
                ) => {
                    e.stopPropagation();
                    setFavourite(
                        info.row.original.championKey,
                        info.row.original.role,
                        !isFavourite(
                            info.row.original.championKey,
                            info.row.original.role
                        )
                    );
                },
            },
            enableSorting: false,
        },
        {
            header: "Role",
            accessorFn: (suggestion) => suggestion.role,
            cell: (info) => <RoleCell role={info.getValue<Role>()} />,
            meta: {
                headerClass: "w-1",
            },
            sortDescFirst: false,
        },
        {
            header: "Champion",
            accessorFn: (suggestion) => suggestion.championKey,
            cell: (info) => (
                <ChampionCell championKey={info.getValue<string>()} />
            ),
            sortingFn: (a, b, id) =>
                dataset()!.championData[
                    a.getValue<string>(id)
                ].name.localeCompare(
                    dataset()!.championData[b.getValue<string>(id)].name
                ),
        },
        ...(config.showAdvancedWinrates
            ? ([
                  {
                      header: "Champions",
                      accessorFn: (suggestion) =>
                          suggestion.draftResult.allyChampionRating.totalRating,
                      cell: (info) => (
                          <div class="flex justify-end">
                              <RatingText rating={info.getValue<number>()} />
                          </div>
                      ),
                  },
                  {
                      header: "Matchups",
                      accessorFn: (suggestion) =>
                          suggestion.draftResult.matchupRating.totalRating,
                      cell: (info) => (
                          <div class="flex justify-end">
                              <RatingText rating={info.getValue<number>()} />
                          </div>
                      ),
                  },
                  {
                      header: "Duos",
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
            header: "Winrate",
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
            createMustSelectToast();
            return;
        }

        pickChampion(
            selection.team,
            selection.index,
            row.original.championKey,
            row.original.role
        );

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
            <Table
                table={table}
                onClickRow={pick}
                rowClassName={(r) =>
                    bans.find((b) => b === r.original.championKey) ||
                    !ownsChampion(r.original.championKey)
                        ? "opacity-30"
                        : ""
                }
                id="draft-table"
            />
            <Dialog
                open={showAnalysisPick()}
                onOpenChange={(open) => {
                    if (!open) setAnalysisPick(undefined);
                }}
            >
                <ChampionDraftAnalysisDialog
                    championKey={analysisPick()!.championKey}
                    team={analysisPick()!.team}
                    openChampionDraftAnalysisModal={(team, championKey) =>
                        setAnalysisPick({ team, championKey, role: undefined })
                    }
                />
            </Dialog>
        </>
    );
}
