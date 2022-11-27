import {
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
} from "@tanstack/solid-table";
import { Icon } from "solid-heroicons";
import { JSX } from "solid-js/jsx-runtime";
import { useDraft } from "../../context/DraftContext";
import { Role } from "../../lib/models/Role";
import { AnalyzeChampionResult } from "../../lib/suggestions/suggestions";
import ChampionCell from "../common/ChampionCell";
import { Table } from "../common/Table";
import { RoleIcon } from "../icons/roles/RoleIcon";
import { arrowLeft, arrowRight } from "solid-heroicons/solid-mini";
import { RoleCell } from "../common/RoleCell";
import { WinnerCell } from "../common/WinnerCell";
import { ratingToWinrate, winrateToRating } from "../../lib/rating/ratings";

interface Props {}

export function IndividualChampionsResult({
    ...props
}: Props & JSX.HTMLAttributes<HTMLDivElement>) {
    const { allyDraftResult } = useDraft();

    const columns: ColumnDef<[AnalyzeChampionResult, AnalyzeChampionResult]>[] =
        [
            {
                header: "Role",
                accessorFn: (result) => result[0].role,
                cell: (info) => <RoleCell role={info.getValue<Role>()} />,
                meta: {
                    headerClass: "w-1",
                    footerClass: "w-1",
                },
            },
            {
                id: "ally-champion",
                header: "Ally",
                accessorFn: (result) => result[0].championKey,
                cell: (info) => (
                    <ChampionCell championKey={info.getValue<string>()} />
                ),
                meta: {
                    headerClass: "w-1",
                    footerClass: "w-1",
                },
            },
            {
                header: "Winrate",
                accessorFn: (result) =>
                    parseFloat((result[0].winrate * 100).toFixed(2)),
                meta: {
                    headerClass: "w-1",
                    footerClass: "w-1",
                },
                footer: () => parseFloat((allyWinrate() * 100).toFixed(2)),
            },
            {
                header: "Winner",
                accessorFn: (result) => result[0].rating - result[1].rating,
                cell: (info) => (
                    <WinnerCell
                        winner={info.getValue<number>() > 0}
                        winrate={ratingToWinrate(info.getValue<number>())}
                    />
                ),
                footer: () => (
                    <WinnerCell
                        winner={allyWinrate() > opponentWinrate()}
                        winrate={ratingToWinrate(
                            winrateToRating(allyWinrate()) -
                                winrateToRating(opponentWinrate())
                        )}
                    />
                ),
                meta: {
                    headerClass: "text-center",
                },
            },
            {
                id: "opponent-champion",
                header: "Opponent",
                accessorFn: (result) => result[1].championKey,
                cell: (info) => (
                    <ChampionCell championKey={info.getValue<string>()} />
                ),
            },
            {
                id: "opponent-winrate",
                header: "Winrate",
                accessorFn: (result) =>
                    parseFloat((result[1].winrate * 100).toFixed(2)),
                footer: () => parseFloat((opponentWinrate() * 100).toFixed(2)),
            },
        ];

    const allyWinrate = () =>
        ratingToWinrate(allyDraftResult()?.allyChampionRating.totalRating ?? 0);

    const opponentWinrate = () =>
        ratingToWinrate(
            allyDraftResult()?.enemyChampionRating.totalRating ?? 0
        );

    const table = createSolidTable({
        get data(): [AnalyzeChampionResult, AnalyzeChampionResult][] {
            const allyChampionResults =
                allyDraftResult()?.allyChampionRating.championResults.sort(
                    (a, b) => a.role - b.role
                ) ?? [];
            const enemyChampionResults =
                allyDraftResult()?.enemyChampionRating.championResults.sort(
                    (a, b) => a.role - b.role
                ) ?? [];

            return allyChampionResults.map((r, i) => [
                r,
                enemyChampionResults[i],
            ]);
        },
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return <Table table={table} {...props} />;
}
