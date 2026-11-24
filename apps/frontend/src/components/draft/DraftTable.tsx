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
import { createSignal, Show, untrack } from "solid-js";
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
import { championMatchesSearch } from "../../utils/search";
import { focusSearch } from "./Search";
import { createTableKeyboardNavigation } from "../../hooks/createTableKeyboardNavigation";
import { ChampionContextMenuContent } from "./ChampionContextMenu";
import {
    PreviewDraftAnalysisProvider,
    PreviewPick,
    useDraftAnalysis,
} from "../../contexts/DraftAnalysisContext";

function PreviewDialogContent(props: { pick: PreviewPick }) {
    // Champion shown in the dialog; starts at the previewed champion and can
    // change when clicking matchups/duos inside the dialog.
    const [shown, setShown] = createSignal<{
        team: Team;
        championKey: string;
    }>(
        untrack(() => ({
            team: props.pick.team,
            championKey: props.pick.championKey,
        })),
    );

    return (
        <ChampionDraftAnalysisDialog
            team={shown().team}
            championKey={shown().championKey}
            openChampionDraftAnalysisModal={(team, championKey) =>
                setShown({ team, championKey })
            }
        />
    );
}

export default function DraftTable() {
    const { dataset } = useDataset();
    const {
        selection,
        selectedChampionKey,
        pickChampion,
        select,
        allBans,
        ownedChampions,
    } = useDraft();
    const { allyTeamComp, opponentTeamComp } = useDraftAnalysis();
    const { search, roleFilter, favouriteFilter, setFavouriteFilter } =
        useDraftFilters();
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
            filtered = filtered.filter((s) =>
                championMatchesSearch(
                    dataset()!.championData[s.championKey],
                    search(),
                    config,
                ),
            );
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
            filtered = filtered.filter((s) => !allBans().has(s.championKey));
        } else if (config.banPlacement === "bottom") {
            filtered = [...filtered].sort((a, b) => {
                const aBanned = allBans().has(a.championKey);
                const bBanned = allBans().has(b.championKey);
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

    // Role the champion in the selected slot is currently played in, so only
    // that row is highlighted instead of every role of the champion.
    const selectedChampionRole = () => {
        const key = selectedChampionKey();
        if (!key) return undefined;
        const comp =
            selection.team === "opponent" ? opponentTeamComp() : allyTeamComp();
        return [...comp.entries()].find(([, k]) => k === key)?.[0];
    };

    const isSelectedChampion = (suggestion: Suggestion) => {
        if (suggestion.championKey !== selectedChampionKey()) return false;
        const role = selectedChampionRole();
        return role === undefined || suggestion.role === role;
    };

    const [previewPick, setPreviewPick] = createSignal<PreviewPick>();
    const [showPreview, setShowPreview] = createSignal(false);

    function openPreview(championKey: string, role: Role | undefined) {
        if (!selection.team) return;
        setPreviewPick({
            team: selection.team,
            index: selection.index,
            championKey,
            role,
        });
        setShowPreview(true);
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
                    dataset()!.championData[b.getValue<string>(id)].name,
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
                        openPreview(
                            info.row.original.championKey,
                            info.row.original.role,
                        );
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

    function pick(row: Row<Suggestion>, e: MouseEvent | KeyboardEvent) {
        if (!selection.team) {
            createMustSelectToast();
            return;
        }

        pickChampion(
            selection.team,
            selection.index,
            row.original.championKey,
            row.original.role,
        );

        if (e instanceof KeyboardEvent) {
            focusSearch();
        }
    }

    createTableKeyboardNavigation("draft-table", (team) => select(team));

    return (
        <>
            <Table
                table={table}
                onClickRow={pick}
                rowClassName={(r) =>
                    isSelectedChampion(r.original)
                        ? "bg-neutral-800! shadow-[inset_3px_0_0_var(--color-neutral-300)]"
                        : allBans().has(r.original.championKey) ||
                            !ownsChampion(r.original.championKey)
                          ? "opacity-30"
                          : ""
                }
                rowContextMenu={(row) => (
                    <ChampionContextMenuContent
                        championKey={row.original.championKey}
                        role={row.original.role}
                        onAnalysis={
                            selection.team
                                ? () =>
                                      openPreview(
                                          row.original.championKey,
                                          row.original.role,
                                      )
                                : undefined
                        }
                    />
                )}
                id="draft-table"
            />
            <Dialog open={showPreview()} onOpenChange={setShowPreview}>
                <Show when={previewPick()} keyed>
                    {(pick) => (
                        <PreviewDraftAnalysisProvider pick={pick}>
                            <PreviewDialogContent pick={pick} />
                        </PreviewDraftAnalysisProvider>
                    )}
                </Show>
            </Dialog>
        </>
    );
}
