import {
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    Row,
    SortingState,
} from "@tanstack/solid-table";
import { useDraft } from "../../context/DraftContext";
import { displayNameByRole, Role } from "../../lib/models/Role";
import { Suggestion } from "../../lib/suggestions/suggestions";
import { Table } from "../common/Table";
import ChampionCell from "../common/ChampionCell";
import { RoleCell } from "../common/RoleCell";
import { formatRating } from "../../utils/rating";
import { createSignal } from "solid-js";

export default function DraftTable() {
    const {
        allySuggestions,
        opponentSuggestions,
        dataset,
        selection,
        search,
        roleFilter,
        pickChampion,
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

        return filtered;
    };

    const columns: ColumnDef<Suggestion>[] = [
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
            cell: (info) => <>{formatRating(info.getValue<number>())}</>,
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
