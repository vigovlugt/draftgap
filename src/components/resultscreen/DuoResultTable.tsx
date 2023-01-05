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
import { Team } from "../../lib/models/Team";
import { ratingToWinrate } from "../../lib/rating/ratings";
import {
    AnalyzeDuoResult,
    AnalyzeMatchupResult,
} from "../../lib/suggestions/suggestions";
import { formatPercentage, formatRating } from "../../utils/rating";
import ChampionCell from "../common/ChampionCell";
import { RoleCell } from "../common/RoleCell";
import { Table } from "../common/Table";
import { WinnerCell } from "../common/WinnerCell";

interface Props {
    team: Team;
}

export function DuoResultTable({
    team,
    ...props
}: Props & JSX.HTMLAttributes<HTMLDivElement>) {
    const { allyDraftResult, opponentDraftResult, dataset } = useDraft();

    const draftResult = team === "ally" ? allyDraftResult : opponentDraftResult;

    const columns: ColumnDef<AnalyzeDuoResult>[] = [
        {
            id: "roleA",
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
            id: "championA",
            header: "Champion",
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
            id: "roleB",
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
            id: "championB",
            header: "Champion",
            accessorFn: (result) => result.championKeyB,
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
            accessorFn: (duo) => duo.rating,
            cell: (info) => <>{formatRating(info.getValue<number>())}</>,
            footer: (info) => <span>{formatPercentage(rating() ?? 0)}</span>,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
        },
    ];

    const rating = () => draftResult()?.allyDuoRating?.totalRating;

    const [sorting, setSorting] = createSignal<SortingState>([]);
    const table = createSolidTable({
        get data() {
            let data = draftResult()?.allyDuoRating?.duoResults;
            if (!data) {
                return [];
            }

            // if (!showAll()) {
            //     data = data.filter((m) => m.roleA === m.roleB);
            // }

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
