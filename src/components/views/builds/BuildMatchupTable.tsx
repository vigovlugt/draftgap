import { JSX } from "solid-js/jsx-runtime";
import { Table } from "../../common/Table";
import { useDraft } from "../../../context/DraftContext";
import {
    ColumnDef,
    SortingState,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
} from "@tanstack/solid-table";
import { Role } from "../../../lib/models/Role";
import { useBuild } from "../../../context/BuildContext";
import { BuildEntityCell } from "../../common/BuildEntityCell";
import { createSignal } from "solid-js";
import { RoleCell } from "../../common/RoleCell";
import ChampionCell from "../../common/ChampionCell";
import { RatingText } from "../../common/RatingText";

export const BuildMatchupTable = (
    props: JSX.HTMLAttributes<HTMLDivElement>
) => {
    const { dataset } = useDraft();
    const { selectedEntity, buildAnalysisResult, partialBuildDataset } =
        useBuild();

    const title = () =>
        ({
            rune: "Rune",
        }[selectedEntity()!.type]);

    const data = () =>
        ({
            rune: buildAnalysisResult()?.runes[selectedEntity()!.runeType][
                selectedEntity()!.id
            ].matchupResult,
        }[selectedEntity()!.type]);

    const columns: ColumnDef<{
        championKey: string;
        role: Role;
        rating: number;
    }>[] = [
        {
            header: "Role",
            accessorFn: () => partialBuildDataset()!.role,
            cell: (info) => <RoleCell role={info.getValue<Role>()} />,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
            sortDescFirst: false,
        },
        {
            header: "Ally",
            accessorFn: () => partialBuildDataset()!.championKey,
            cell: (info) => (
                <ChampionCell championKey={info.getValue<string>()} hideName />
            ),
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
            sortingFn: (a, b, id) =>
                dataset()!.championData[
                    a.getValue<string>(id)
                ].name.localeCompare(
                    dataset()!.championData[b.getValue<string>(id)].name
                ),
        },
        {
            header: title,
            id: "entity",
            cell: () => (
                <BuildEntityCell
                    entityId={selectedEntity()!.id}
                    entityType={selectedEntity()!.type}
                    hideName
                />
            ),
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
        },
        {
            header: () => <div class="text-center w-full uppercase">VS</div>,
            id: "seperator",
            cell: () => <div class="w-20"></div>,
            meta: {
                headerClass: "w-1 text-center",
                footerClass: "w-1",
            },
        },
        {
            header: "Role",
            id: "opponentRole",
            accessorFn: (result) => result.role,
            cell: (info) => <RoleCell role={info.getValue<Role>()} />,
            sortDescFirst: false,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
        },
        {
            header: "Opponent",
            id: "opponentChampionKey",
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
            id: "rating",
            accessorFn: (result) => result.rating,
            cell: (info) => <RatingText rating={info.getValue<number>()} />,
        },
    ];

    const [sorting, setSorting] = createSignal<SortingState>([]);
    const table = createSolidTable({
        get data() {
            return data()?.matchupResults.sort((a, b) => a.role - b.role) ?? [];
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
};
