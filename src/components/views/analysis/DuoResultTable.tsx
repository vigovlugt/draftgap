import {
    CellContext,
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/solid-table";
import { createSignal, JSX, Show } from "solid-js";
import { useDraft } from "../../../context/DraftContext";
import { Role } from "../../../lib/models/Role";
import { Team } from "../../../lib/models/Team";
import { AnalyzeDuoResult } from "../../../lib/draft/analysis";
import ChampionCell from "../../common/ChampionCell";
import { RatingText } from "../../common/RatingText";
import { RoleCell } from "../../common/RoleCell";
import { Table } from "../../common/Table";
import { WinrateDecompositionModal } from "../../modals/WinrateDecompositionModal";
import { useDraftAnalysis } from "../../../context/DraftAnalysisContext";

interface Props {
    team: Team;
    data?: () => AnalyzeDuoResult[];
    onClickChampion?: (championKey: string) => void;
    halfDuoRating?: boolean;
}

export function DuoResultTable(
    props: Props & JSX.HTMLAttributes<HTMLDivElement>
) {
    const { dataset } = useDraft();
    const { allyDraftAnalysis, opponentDraftAnalysis } = useDraftAnalysis();

    const [confidenceAnalysisModalIsOpen, setConfidenceAnalysisModalIsOpen] =
        createSignal(false);
    const [chosenResult, setChosenResult] = createSignal<{
        games: number;
        wins: number;
        rating: number;
    }>();

    const draftAnalysis = () =>
        props.team === "ally" ? allyDraftAnalysis() : opponentDraftAnalysis();

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
            cell: (info) => (
                <RatingText
                    rating={info.getValue<number>()}
                    games={info.row.original.games}
                />
            ),
            footer: () => <RatingText rating={rating() ?? 0} />,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
                onClickCell: (
                    e: MouseEvent,
                    info: CellContext<AnalyzeDuoResult, unknown>
                ) => {
                    e.stopPropagation();
                    setChosenResult(info.row.original);
                    setConfidenceAnalysisModalIsOpen(true);
                },
            },
        },
    ];

    const rating = () =>
        table
            .getRowModel()
            .rows.map((r) => r.original.rating)
            // eslint-disable-next-line solid/reactivity
            .reduce((a, b) => a + b / (props.halfDuoRating ? 2 : 1), 0);

    const [sorting, setSorting] = createSignal<SortingState>([]);
    const table = createSolidTable({
        get data() {
            if (props.data) {
                return props.data();
            }

            const data = draftAnalysis()?.allyDuoRating?.duoResults;
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

    return (
        <>
            <Table table={table} {...props} />
            <Show when={chosenResult() !== undefined}>
                <WinrateDecompositionModal
                    isOpen={confidenceAnalysisModalIsOpen()}
                    setIsOpen={setConfidenceAnalysisModalIsOpen}
                    data={chosenResult()!}
                />
            </Show>
        </>
    );
}
