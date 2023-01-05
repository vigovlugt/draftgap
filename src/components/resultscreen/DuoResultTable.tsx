import {
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
} from "@tanstack/solid-table";
import { Accessor, JSX } from "solid-js";
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
    const { allyDraftResult, opponentDraftResult } = useDraft();

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
        },
        {
            header: "Winrate",
            accessorFn: (duo) => formatRating(duo.rating),
            footer: (info) => <span>{formatPercentage(rating() ?? 0)}</span>,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
        },
    ];

    const rating = () => draftResult()?.allyDuoRating?.totalRating;

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
        getCoreRowModel: getCoreRowModel(),
    });

    return <Table table={table} {...props} />;
}
