import {
    CellContext,
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/solid-table";
import { createSignal, JSX, Show } from "solid-js";
import { Role } from "../../../lib/models/Role";
import { Team } from "../../../lib/models/Team";
import {
    AnalyzeChampionResult,
    AnalyzeMatchupResult,
} from "../../../lib/draft/analysis";
import ChampionCell from "../../common/ChampionCell";
import { RatingText } from "../../common/RatingText";
import { RoleCell } from "../../common/RoleCell";
import { Table } from "../../common/Table";
import { WinnerCell } from "../../common/WinnerCell";
import { useDraftAnalysis } from "../../../contexts/DraftAnalysisContext";
import { useDataset } from "../../../contexts/DatasetContext";
import { Dialog } from "../../common/Dialog";
import { WinrateDecompositionDialog } from "../../dialogs/WinrateDecompositionDialog";

interface Props {
    showAll: boolean;
    data?: () => AnalyzeMatchupResult[];
    onClickChampion?: (team: Team, championKey: string) => void;
    truncateChampionNames?: boolean;
}

export function MatchupResultTable(
    props: Props & JSX.HTMLAttributes<HTMLDivElement>
) {
    const { dataset } = useDataset();
    const { allyDraftAnalysis } = useDraftAnalysis();

    const [confidenceAnalysisModalIsOpen, setConfidenceAnalysisModalIsOpen] =
        createSignal(false);
    const [chosenResult, setChosenResult] = createSignal<{
        games: number;
        wins: number;
        rating: number;
    }>();

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
                <ChampionCell
                    championKey={info.getValue<string>()}
                    nameMaxLength={props.truncateChampionNames ? 6 : undefined}
                />
            ),
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
                onClickCell: (
                    e: MouseEvent,
                    info: CellContext<AnalyzeChampionResult, unknown>
                ) => {
                    e.stopPropagation();
                    props.onClickChampion?.("ally", info.getValue<string>());
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
            accessorFn: (result) => result.rating,

            cell: (info) => (
                <RatingText
                    rating={info.getValue<number>()}
                    games={info.row.original.games}
                />
            ),
            footer: () => <RatingText rating={allyRating() ?? 0} />,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
                onClickCell: (
                    e: MouseEvent,
                    info: CellContext<AnalyzeMatchupResult, unknown>
                ) => {
                    e.stopPropagation();
                    setChosenResult(info.row.original);
                    setConfidenceAnalysisModalIsOpen(true);
                },
            },
        },
        {
            header: () => <div class="text-center w-full">Winner</div>,
            id: "winner",
            accessorFn: (result) => result.rating > 0,
            cell: (info) => <WinnerCell winner={info.getValue<boolean>()} />,
            footer: () => (
                <WinnerCell winner={allyRating() > opponentRating()} />
            ),
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
                <ChampionCell
                    championKey={info.getValue<string>()}
                    nameMaxLength={props.truncateChampionNames ? 6 : undefined}
                />
            ),
            sortingFn: (a, b, id) =>
                dataset()!.championData[
                    a.getValue<string>(id)
                ].name.localeCompare(
                    dataset()!.championData[b.getValue<string>(id)].name
                ),
            meta: {
                onClickCell: (
                    e: MouseEvent,
                    info: CellContext<AnalyzeChampionResult, unknown>
                ) => {
                    e.stopPropagation();
                    props.onClickChampion?.(
                        "opponent",
                        info.getValue<string>()
                    );
                },
            },
        },
        {
            id: "opponent-winrate",
            header: "Winrate",
            accessorFn: (result) => -result.rating,
            cell: (info) => (
                <RatingText
                    rating={info.getValue<number>()}
                    games={info.row.original.games}
                />
            ),
            footer: () => <RatingText rating={opponentRating()} />,
            meta: {
                onClickCell: (
                    e: MouseEvent,
                    info: CellContext<AnalyzeMatchupResult, unknown>
                ) => {
                    e.stopPropagation();
                    setChosenResult({
                        ...info.row.original,
                        rating: -info.row.original.rating,
                        wins: info.row.original.games - info.row.original.wins,
                    });
                    setConfidenceAnalysisModalIsOpen(true);
                },
            },
        },
    ];

    const allyRating = () =>
        table
            .getRowModel()
            .rows.map((r) => r.original.rating)
            .reduce((a, b) => a + b, 0);
    const opponentRating = () => -allyRating();

    const [sorting, setSorting] = createSignal<SortingState>([]);
    const table = createSolidTable({
        get data() {
            if (props.data) {
                return props.data();
            }

            let data = allyDraftAnalysis()?.matchupRating?.matchupResults;
            if (!data) {
                return [];
            }

            if (!props.showAll) {
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

    return (
        <>
            <Table table={table} {...props} />
            <Show when={chosenResult() !== undefined}>
                <Dialog
                    open={confidenceAnalysisModalIsOpen()}
                    onOpenChange={setConfidenceAnalysisModalIsOpen}
                >
                    <WinrateDecompositionDialog data={chosenResult()!} />
                </Dialog>
            </Show>
        </>
    );
}
