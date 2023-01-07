import {
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/solid-table";
import { Accessor, createSignal, JSX } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { Role } from "../../lib/models/Role";
import { AnalyzeMatchupResult } from "../../lib/suggestions/suggestions";
import ChampionCell from "../common/ChampionCell";
import { RatingText } from "../common/RatingText";
import { RoleCell } from "../common/RoleCell";
import { Table } from "../common/Table";
import { WinnerCell } from "../common/WinnerCell";

interface Props {
    showAll: Accessor<boolean>;
}

export function MatchupResultTable({
    showAll,
    ...props
}: Props & JSX.HTMLAttributes<HTMLDivElement>) {
    const { allyDraftResult, dataset } = useDraft();

    const columns: ColumnDef<AnalyzeMatchupResult>[] = [
        {
            header: "Role",
            accessorFn: (result) => result.roleA,
            cell: (info) => <RoleCell role={info.getValue<Role>()} />,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
            sortDescFirst: false,
        },
        {
            header: "Ally",
            accessorFn: (result) => result.championKeyA,
            cell: (info) => (
                <ChampionCell championKey={info.getValue<string>()} />
            ),
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
            sortingFn: (a, b, id) =>
                dataset()!.championData[
                    a.getValue<string>(id)
                ].name.localeCompare(
                    dataset()!.championData[b.getValue<string>(id)].name
                ),
        },
        {
            header: "Winrate",
            accessorFn: (result) => result.rating,

            cell: (info) => <RatingText rating={info.getValue<number>()} />,
            footer: (info) => <RatingText rating={allyRating() ?? 0} />,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
        },
        {
            header: "Winner",
            accessorFn: (result) => result.rating > 0,
            cell: (info) => <WinnerCell winner={info.getValue<boolean>()} />,
            footer: () => (
                <WinnerCell winner={allyRating() > opponentRating()} />
            ),
            meta: {
                headerClass: "text-center",
            },
        },
        {
            id: "opponent-role",
            header: "Role",
            accessorFn: (result) => result.roleB,
            cell: (info) => <RoleCell role={info.getValue<Role>()} />,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
            sortDescFirst: false,
        },
        {
            header: "Opponent",
            accessorFn: (result) => result.championKeyB,
            cell: (info) => (
                <ChampionCell championKey={info.getValue<string>()} />
            ),
            footer: (info) => <RatingText rating={opponentRating()} />,
            sortingFn: (a, b, id) =>
                dataset()!.championData[
                    a.getValue<string>(id)
                ].name.localeCompare(
                    dataset()!.championData[b.getValue<string>(id)].name
                ),
        },
        {
            id: "opponent-winrate",
            header: "Winrate",
            accessorFn: (result) => -result.rating,
            cell: (info) => <RatingText rating={info.getValue<number>()} />,
        },
    ];

    const allyRating = () => allyDraftResult()?.matchupRating?.totalRating ?? 0;
    const opponentRating = () =>
        -(allyDraftResult()?.matchupRating?.totalRating ?? 0);

    const [sorting, setSorting] = createSignal<SortingState>([]);
    const table = createSolidTable({
        get data() {
            let data = allyDraftResult()?.matchupRating?.matchupResults;
            if (!data) {
                return [];
            }

            if (!showAll()) {
                data = data.filter((m) => m.roleA === m.roleB);
            }

            return data.sort((a, b) => a.roleA - b.roleA || a.roleB - b.roleB);
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

    return <Table table={table} {...props} />;
}
