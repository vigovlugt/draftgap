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
import { RoleCell } from "../common/RoleCell";
import { ratingToWinrate } from "../../lib/rating/ratings";
import { Team } from "../../lib/models/Team";

interface Props {
    team: Team;
}

export function IndividualChampionsResult({
    team,
    ...props
}: Props & JSX.HTMLAttributes<HTMLDivElement>) {
    const { allyDraftResult, opponentDraftResult } = useDraft();

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
        },
        {
            id: "champion",
            header: "Champion",
            accessorFn: (result) => result.championKey,
            cell: (info) => (
                <ChampionCell championKey={info.getValue<string>()} />
            ),
        },
        {
            header: "Winrate",
            accessorFn: (result) =>
                parseFloat((result.winrate * 100).toFixed(2)),
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
            footer: () => parseFloat((allyWinrate() * 100).toFixed(2)),
        },
    ];

    const allyWinrate = () =>
        ratingToWinrate(draftResult()?.allyChampionRating.totalRating ?? 0);

    const table = createSolidTable({
        get data(): AnalyzeChampionResult[] {
            const championResults =
                draftResult()?.allyChampionRating.championResults.sort(
                    (a, b) => a.role - b.role
                ) ?? [];
            return championResults;
        },
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return <Table table={table} {...props} />;
}
