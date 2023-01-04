import {
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
} from "@tanstack/solid-table";
import { Accessor, JSX } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { Role } from "../../lib/models/Role";
import { ratingToWinrate } from "../../lib/rating/ratings";
import { AnalyzeMatchupResult } from "../../lib/suggestions/suggestions";
import ChampionCell from "../common/ChampionCell";
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
    const { allyDraftResult } = useDraft();

    const columns: ColumnDef<AnalyzeMatchupResult>[] = [
        {
            header: "Role",
            accessorFn: (result) => result.roleA,
            cell: (info) => <RoleCell role={info.getValue<Role>()} />,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
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
        },
        {
            header: "Winrate",
            accessorFn: (result) =>
                parseFloat((ratingToWinrate(result.rating) * 100).toFixed(2)),
            footer: (info) => (
                <span>{parseFloat((allyWinrate() * 100).toFixed(2))}</span>
            ),
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
                <WinnerCell winner={allyWinrate() > opponentWinrate()} />
            ),
            meta: {
                headerClass: "text-center",
            },
        },
        {
            header: "Opponent",
            accessorFn: (result) => result.championKeyB,
            cell: (info) => (
                <ChampionCell championKey={info.getValue<string>()} />
            ),
            footer: () => (
                <span>{parseFloat((opponentWinrate() * 100).toFixed(2))}</span>
            ),
        },
        {
            id: "opponent-winrate",
            header: "Winrate",
            accessorFn: (result) =>
                parseFloat((ratingToWinrate(-result.rating) * 100).toFixed(2)),
        },
    ];

    const allyWinrate = () =>
        ratingToWinrate(allyDraftResult()?.matchupRating?.totalRating ?? 0);
    const opponentWinrate = () =>
        ratingToWinrate(-(allyDraftResult()?.matchupRating?.totalRating ?? 0));

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
        getCoreRowModel: getCoreRowModel(),
    });

    return <Table table={table} {...props} />;
}
