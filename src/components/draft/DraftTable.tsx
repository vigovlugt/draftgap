import {
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    Row,
} from "@tanstack/solid-table";
import { useDraft } from "../../context/DraftContext";
import { Role } from "../../lib/models/Role";
import { Suggestion } from "../../lib/suggestions/suggestions";
import { RoleIcon } from "../icons/roles/RoleIcon";
import { Table } from "../common/Table";
import ChampionCell from "../common/ChampionCell";
import { RoleCell } from "../common/RoleCell";

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
        },
        {
            header: "Champion",
            accessorFn: (suggestion) => suggestion.championKey,
            cell: (info) => (
                <ChampionCell championKey={info.getValue<string>()} />
            ),
        },
        {
            header: "Winrate",
            accessorFn: (suggestion) =>
                parseFloat((suggestion.draftResult.winrate * 100).toFixed(2)),
        },
    ];

    const table = createSolidTable({
        get data() {
            return filteredSuggestions();
        },
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    function pick(row: Row<Suggestion>) {
        if (!selection.team) {
            return;
        }

        pickChampion(
            selection.team,
            selection.index,
            row.original.championKey,
            selection.team === "ally" ? row.original.role : undefined
        );
    }

    return <Table table={table} onClickRow={pick} />;
}
