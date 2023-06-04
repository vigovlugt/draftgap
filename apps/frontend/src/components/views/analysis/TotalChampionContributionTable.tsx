import {
    CellContext,
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/solid-table";
import { Component, createSignal, splitProps } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Role } from "draftgap-core/src/models/Role";
import { Team } from "draftgap-core/src/models/Team";
import {
    AnalyzeChampionResult,
    AnalyzeDuoResult,
    AnalyzeMatchupResult,
} from "draftgap-core/src/draft/analysis";
import ChampionCell from "../../common/ChampionCell";
import { RatingText } from "../../common/RatingText";
import { RoleCell } from "../../common/RoleCell";
import { Table } from "../../common/Table";
import { useUser } from "../../../contexts/UserContext";
import { useDraftAnalysis } from "../../../contexts/DraftAnalysisContext";
import { useDataset } from "../../../contexts/DatasetContext";

type Props = {
    team: Team;
    onClickChampion?: (championKey: string) => void;
} & JSX.HTMLAttributes<HTMLDivElement>;

type ChampionContribution = {
    role: Role;
    championKey: string;
    baseRating: number;
    duoRating: number;
    matchupRating: number;
    totalRating: number;
};

export const TotalChampionContributionTable: Component<Props> = (_props) => {
    const [props, other] = splitProps(_props, ["team", "onClickChampion"]);
    const { config } = useUser();
    const { dataset } = useDataset();
    const {
        allyTeamComp,
        opponentTeamComp,
        allyDraftAnalysis,
        opponentDraftAnalysis,
    } = useDraftAnalysis();

    const draftResult = () =>
        props.team === "ally" ? allyDraftAnalysis() : opponentDraftAnalysis();

    const columns: ColumnDef<ChampionContribution>[] = [
        {
            header: "Role",
            accessorFn: (result) => result.role,
            cell: (info) => <RoleCell role={info.getValue<Role>()} />,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
            sortDescFirst: true,
        },
        {
            id: "champion",
            header: "Champion",
            accessorFn: (result) => result.championKey,
            cell: (info) => (
                <ChampionCell
                    championKey={info.getValue<string>()}
                    nameMaxLength={6}
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
                    info: CellContext<ChampionContribution, unknown>
                ) => {
                    e.stopPropagation();
                    props.onClickChampion?.(info.getValue<string>());
                },
            },
        },
        {
            id: "base",
            header: "Base",
            accessorFn: (result) => result.baseRating,
            cell: (info) => <RatingText rating={info.getValue<number>()} />,
            footer: () => (
                <RatingText
                    rating={draftResult()!.allyChampionRating.totalRating}
                />
            ),
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
        },
        {
            header: "Matchup",
            accessorFn: (result) => result.matchupRating,
            cell: (info) => <RatingText rating={info.getValue<number>()} />,
            footer: () => (
                <RatingText rating={draftResult()!.matchupRating.totalRating} />
            ),
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
        },
        {
            header: "Duo",
            accessorFn: (result) => result.duoRating,
            cell: (info) => <RatingText rating={info.getValue<number>()} />,
            footer: () => (
                <RatingText rating={draftResult()!.allyDuoRating.totalRating} />
            ),
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
        },
        {
            header: "Total",
            accessorFn: (result) => result.totalRating,
            cell: (info) => <RatingText rating={info.getValue<number>()} />,
            footer: () => (
                <RatingText
                    rating={table
                        .getRowModel()
                        .flatRows.map((r) => r.original.totalRating)
                        .reduce((a, b) => a + b, 0)}
                />
            ),
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
        },
    ];

    const [sorting, setSorting] = createSignal<SortingState>([]);
    const table = createSolidTable({
        get data(): ChampionContribution[] {
            if (!draftResult()) return [];

            const comp =
                props.team === "ally" ? allyTeamComp() : opponentTeamComp();
            const champions = [...comp.entries()]
                .sort((a, b) => a[0] - b[0])
                .map((e) => e[1]);

            const roleByChampionKey = new Map<string, Role>();
            for (const [role, championKey] of comp.entries()) {
                roleByChampionKey.set(championKey, role);
            }

            const allyChampionResultByChampionKey =
                draftResult()!.allyChampionRating.championResults.reduce(
                    (acc, result) => {
                        acc.set(result.championKey, result);
                        return acc;
                    },
                    new Map<string, AnalyzeChampionResult>()
                );

            const allyDuoResultsByChampionKey =
                draftResult()!.allyDuoRating.duoResults.reduce(
                    (acc, result) => {
                        if (!acc.has(result.championKeyA)) {
                            acc.set(result.championKeyA, []);
                        }
                        if (!acc.has(result.championKeyB)) {
                            acc.set(result.championKeyB, []);
                        }
                        acc.get(result.championKeyA)!.push(result);
                        acc.get(result.championKeyB)!.push(result);

                        return acc;
                    },
                    new Map<string, AnalyzeDuoResult[]>()
                );

            const allyMatchupResultsByChampionKey =
                draftResult()!.matchupRating.matchupResults.reduce(
                    (acc, result) => {
                        if (!acc.has(result.championKeyA)) {
                            acc.set(result.championKeyA, []);
                        }
                        acc.get(result.championKeyA)!.push(result);

                        return acc;
                    },
                    new Map<string, AnalyzeMatchupResult[]>()
                );

            const contributions = champions.map((championKey) => {
                const allyChampionResult =
                    allyChampionResultByChampionKey.get(championKey);
                const allyDuoResults =
                    allyDuoResultsByChampionKey.get(championKey) ?? [];
                const matchupResults =
                    allyMatchupResultsByChampionKey.get(championKey) ?? [];

                const baseRating = allyChampionResult?.rating ?? 0;
                const matchupRating = matchupResults.reduce(
                    (acc, result) => acc + result.rating,
                    0
                );
                const duoRating = allyDuoResults.reduce(
                    (acc, result) => acc + result.rating / 2,
                    0
                );

                const totalRating = baseRating + matchupRating + duoRating;

                return {
                    championKey,
                    role: roleByChampionKey.get(championKey)!,
                    baseRating,
                    duoRating,
                    matchupRating,
                    totalRating,
                };
            });

            return contributions;
        },
        columns,
        state: {
            get sorting() {
                return sorting();
            },
            get columnVisibility() {
                return {
                    base: !config.ignoreChampionWinrates,
                };
            },
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return <Table table={table} {...other} />;
};
