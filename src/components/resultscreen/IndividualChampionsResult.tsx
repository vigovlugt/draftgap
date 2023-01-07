import {
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/solid-table";
import { JSX } from "solid-js/jsx-runtime";
import { useDraft } from "../../context/DraftContext";
import { Role } from "../../lib/models/Role";
import { AnalyzeChampionResult } from "../../lib/suggestions/suggestions";
import ChampionCell from "../common/ChampionCell";
import { Table } from "../common/Table";
import { RoleCell } from "../common/RoleCell";
import { Team } from "../../lib/models/Team";
import { createSignal } from "solid-js";
import { RatingText } from "../common/RatingText";

interface Props {
    team: Team;
}

export function IndividualChampionsResult({
    team,
    ...props
}: Props & JSX.HTMLAttributes<HTMLDivElement>) {
    const { allyDraftResult, opponentDraftResult, dataset } = useDraft();

    const draftResult = team === "ally" ? allyDraftResult : opponentDraftResult;

    const columns: ColumnDef<AnalyzeChampionResult>[] = [
        {
            header: "Role",
            accessorFn: (result) => result.role,
            cell: (info) => <RoleCell role={info.getValue<Role>()} />,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
            sortDescFirst: false,
        },
        {
            id: "champion",
            header: "Champion",
            accessorFn: (result) => result.championKey,
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
            accessorFn: (result) => result.rating,
            cell: (info) => <RatingText rating={info.getValue<number>()} />,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
            footer: (info) => <RatingText rating={allyRating() ?? 0} />,
        },
    ];

    const allyRating = () => draftResult()?.allyChampionRating.totalRating;

    const [sorting, setSorting] = createSignal<SortingState>([]);
    const table = createSolidTable({
        get data(): AnalyzeChampionResult[] {
            const championResults =
                draftResult()?.allyChampionRating.championResults.sort(
                    (a, b) => a.role - b.role
                ) ?? [];
            return championResults;
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
