import {
    CellContext,
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    Row,
    SortingState,
} from "@tanstack/solid-table";
import { useDraft } from "../../context/DraftContext";
import { Role } from "../../lib/models/Role";
import { Suggestion } from "../../lib/suggestions/suggestions";
import { Table } from "../common/Table";
import ChampionCell from "../common/ChampionCell";
import { RoleCell } from "../common/RoleCell";
import { createSignal, Show } from "solid-js";
import { Icon } from "solid-heroicons";
import { star } from "solid-heroicons/solid";
import { star as starOutline } from "solid-heroicons/outline";
import { RatingText } from "../common/RatingText";
import { createMustSelectToast } from "../../utils/toast";

export default function DraftTable() {
    const {
        allySuggestions,
        opponentSuggestions,
        dataset,
        selection,
        search,
        roleFilter,
        pickChampion,
        favouriteFilter,
        setFavouriteFilter,
        isFavourite,
        toggleFavourite,
    } = useDraft();

    const suggestions = () =>
        selection.team === "opponent"
            ? opponentSuggestions()
            : allySuggestions();

    const filteredSuggestions = () => {
        let filtered = suggestions();
        if (!dataset()) {
            return filtered;
        }

        if (search()) {
            const str = search()
                .replaceAll(/[^a-zA-Z0-9]/g, "")
                .toLowerCase();
            filtered = filtered.filter((s) =>
                dataset()!
                    .championData[s.championKey].name.replaceAll(
                        /[^a-zA-Z0-9]/g,
                        ""
                    )
                    .toLowerCase()
                    .includes(str)
            );
        }

        if (roleFilter() !== undefined) {
            filtered = filtered.filter((s) => s.role === roleFilter());
        }

        if (favouriteFilter()) {
            filtered = filtered.filter((s) =>
                isFavourite(s.championKey, s.role)
            );
        }

        return filtered;
    };

    const columns: ColumnDef<Suggestion>[] = [
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
                    toggleFavourite(
                        info.row.original.championKey,
                        info.row.original.role
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
        {
            header: "Winrate",
            accessorFn: (suggestion) => suggestion.draftResult.totalRating,
            cell: (info) => <RatingText rating={info.getValue<number>()} />,
        },
    ];

    const [sorting, setSorting] = createSignal<SortingState>([]);
    const table = createSolidTable({
        get data() {
            return filteredSuggestions();
        },
        columns,
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
    }

    return <Table table={table} onClickRow={pick} />;
}
