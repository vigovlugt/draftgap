import {
    CellContext,
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/solid-table";
import { createSignal, JSX } from "solid-js";
import { useDraft } from "../../../context/DraftContext";
import { Role } from "../../../lib/models/Role";
import { Team } from "../../../lib/models/Team";
import { AnalyzeDuoResult } from "../../../lib/draft/analysis";
import ChampionCell from "../../common/ChampionCell";
import { RatingText } from "../../common/RatingText";
import { RoleCell } from "../../common/RoleCell";
import { Table } from "../../common/Table";

interface Props {
    team: Team;
    data?: () => AnalyzeDuoResult[];
    onClickChampion?: (championKey: string) => void;
    halfDuoRating?: boolean;
}

export function DuoResultTable(
    props: Props & JSX.HTMLAttributes<HTMLDivElement>
) {
    const { allyDraftResult, opponentDraftResult, dataset } = useDraft();

    const draftResult =
        props.team === "ally" ? allyDraftResult : opponentDraftResult;

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
                <ChampionCell
                    championKey={info.getValue<string>()}
                    nameMaxLength={6}
                />
            ),
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
                onClickCell: (
                    e: MouseEvent,
                    info: CellContext<AnalyzeDuoResult, unknown>
                ) => {
                    e.stopPropagation();
                    props.onClickChampion?.(info.getValue<string>());
                },
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
                <ChampionCell
                    championKey={info.getValue<string>()}
                    nameMaxLength={6}
                />
            ),
            meta: {
                onClickCell: (
                    e: MouseEvent,
                    info: CellContext<AnalyzeDuoResult, unknown>
                ) => {
                    e.stopPropagation();
                    props.onClickChampion?.(info.getValue<string>());
                },
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
            cell: (info) => <RatingText rating={info.getValue<number>()} />,
            footer: (info) => <RatingText rating={rating() ?? 0} />,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
        },
    ];

    const rating = () =>
        table
            .getRowModel()
            .rows.map((r) => r.original.rating)
            .reduce((a, b) => a + b / (props.halfDuoRating ? 2 : 1), 0);

    const [sorting, setSorting] = createSignal<SortingState>([]);
    const table = createSolidTable({
        get data() {
            if (props.data) {
                return props.data();
            }

            let data = draftResult()?.allyDuoRating?.duoResults;
            if (!data) {
                return [];
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
