import {
    CellContext,
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/solid-table";
import { JSX } from "solid-js/jsx-runtime";
import { Role } from "@draftgap/core/src/models/Role";
import { AnalyzeChampionResult } from "@draftgap/core/src/draft/analysis";
import ChampionCell from "../../common/ChampionCell";
import { Table } from "../../common/Table";
import { RoleCell } from "../../common/RoleCell";
import { Team } from "@draftgap/core/src/models/Team";
import { createSignal, Show, splitProps } from "solid-js";
import { RatingText } from "../../common/RatingText";
import { useDraftAnalysis } from "../../../contexts/DraftAnalysisContext";
import { useDataset } from "../../../contexts/DatasetContext";
import { Dialog } from "../../common/Dialog";
import { WinrateDecompositionDialog } from "../../dialogs/WinrateDecompositionDialog";

interface Props {
    team: Team;
    onClickChampion?: (championKey: string) => void;
}

export function IndividualChampionsResultTable(
    _props: Props & JSX.HTMLAttributes<HTMLDivElement>,
) {
    const [props, externalProps] = splitProps(_props, [
        "team",
        "onClickChampion",
    ]);
    const { dataset } = useDataset();
    const { allyDraftAnalysis, opponentDraftAnalysis } = useDraftAnalysis();

    const [confidenceAnalysisModalIsOpen, setConfidenceAnalysisModalIsOpen] =
        createSignal(false);
    const [chosenResult, setChosenResult] = createSignal<{
        games: number;
        wins: number;
        rating: number;
    }>();

    const draftResult = () =>
        props.team === "ally" ? allyDraftAnalysis() : opponentDraftAnalysis();

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
                    dataset()!.championData[b.getValue<string>(id)].name,
                ),
            meta: {
                onClickCell: (
                    e: MouseEvent,
                    info: CellContext<AnalyzeChampionResult, unknown>,
                ) => {
                    e.stopPropagation();
                    props.onClickChampion?.(info.getValue<string>());
                },
            },
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
                    info: CellContext<AnalyzeChampionResult, unknown>,
                ) => {
                    e.stopPropagation();
                    setChosenResult(info.row.original);
                    setConfidenceAnalysisModalIsOpen(true);
                },
            },
        },
    ];

    const allyRating = () => draftResult()?.allyChampionRating.totalRating;

    const [sorting, setSorting] = createSignal<SortingState>([]);
    const table = createSolidTable({
        get data(): AnalyzeChampionResult[] {
            const championResults =
                draftResult()?.allyChampionRating.championResults.sort(
                    (a, b) => a.role - b.role,
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

    return (
        <>
            <Table table={table} {...externalProps} />
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
