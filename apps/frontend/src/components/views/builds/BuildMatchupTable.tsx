import { JSX } from "solid-js/jsx-runtime";
import { Table } from "../../common/Table";
import {
    CellContext,
    ColumnDef,
    SortingState,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
} from "@tanstack/solid-table";
import { Role } from "@draftgap/core/src/models/Role";
import { useBuild } from "../../../contexts/BuildContext";
import { BuildEntityCell } from "../../common/BuildEntityCell";
import { createSignal } from "solid-js";
import { RoleCell } from "../../common/RoleCell";
import ChampionCell from "../../common/ChampionCell";
import { RatingText } from "../../common/RatingText";
import { formatPercentage } from "../../../utils/rating";
import { useDataset } from "../../../contexts/DatasetContext";
import { Dialog } from "../../common/Dialog";
import { WinrateDecompositionDialog } from "../../dialogs/WinrateDecompositionDialog";
import { EntityMatchupAnalysisResult } from "@draftgap/core/src/builds/entity-analysis";

export const BuildMatchupTable = (
    props: JSX.HTMLAttributes<HTMLDivElement>
) => {
    const { dataset } = useDataset();
    const { selectedEntity, buildAnalysisResult, partialBuildDataset } =
        useBuild();

    const [confidenceAnalysisModalIsOpen, setConfidenceAnalysisModalIsOpen] =
        createSignal(false);
    const [chosenResult, setChosenResult] = createSignal<{
        games: number;
        wins: number;
        rating: number;
    }>();

    const title = () =>
        ({
            rune: "Rune",
            item: "Item",
            summonerSpells: "Spells",
            skills: "Skills",
        }[selectedEntity()!.type]);

    const data = () => {
        const selected = selectedEntity();
        switch (selected?.type) {
            case "rune": {
                switch (selected.runeType) {
                    case "primary":
                        return buildAnalysisResult()?.runes.primary[selected.id]
                            .matchupResult;
                    case "secondary":
                        return buildAnalysisResult()?.runes.secondary[
                            selected.id
                        ].matchupResult;
                    case "shard-offense":
                        return buildAnalysisResult()?.runes.shards.offense[
                            selected.id
                        ].matchupResult;
                    case "shard-flex":
                        return buildAnalysisResult()?.runes.shards.flex[
                            selected.id
                        ].matchupResult;
                    case "shard-defense":
                        return buildAnalysisResult()?.runes.shards.defense[
                            selected.id
                        ].matchupResult;
                }
                break;
            }
            case "item": {
                switch (selected.itemType) {
                    case "startingSets":
                        return buildAnalysisResult()?.items.startingSets[
                            selected.id
                        ].matchupResult;
                    case "sets":
                        return buildAnalysisResult()?.items.sets[selected.id]
                            .matchupResult;
                    case "boots":
                        return buildAnalysisResult()?.items.boots[selected.id]
                            .matchupResult;
                    default:
                        return buildAnalysisResult()?.items.statsByOrder[
                            selected.itemType
                        ][selected.id].matchupResult;
                }
            }
            case "summonerSpells": {
                return buildAnalysisResult()?.summonerSpells[selected.id]
                    .matchupResult;
            }
            case "skills": {
                switch (selected.skillsType) {
                    case "order":
                        return buildAnalysisResult()?.skills.order[selected.id]
                            .matchupResult;
                    case "level":
                        return buildAnalysisResult()?.skills.levels[
                            selected.level
                        ][selected.id].matchupResult;
                }
            }
        }
    };

    const columns: ColumnDef<EntityMatchupAnalysisResult>[] = [
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
            cell: () => <BuildEntityCell entity={selectedEntity()!} hideName />,
            meta: {
                headerClass: "w-1",
                footerClass: "w-1",
            },
        },
        {
            header: () => <div class="text-center w-full uppercase">VS</div>,
            id: "seperator",
            cell: () => <div class="w-20" />,
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
            cell: (info) => (
                <RatingText
                    rating={info.getValue<number>()}
                    games={info.row.original.games}
                />
            ),
            meta: {
                onClickCell: (
                    e: MouseEvent,
                    info: CellContext<EntityMatchupAnalysisResult, unknown>
                ) => {
                    e.stopPropagation();
                    setChosenResult(info.row.original);
                    setConfidenceAnalysisModalIsOpen(true);
                },
            },
        },
        ...(import.meta.env.DEV
            ? ([
                  {
                      header: "Games",
                      id: "games",
                      accessorFn: (result) => (result as any).raw.games,
                  },
                  {
                      header: "Delta",
                      id: "delta",
                      accessorFn: (result) =>
                          formatPercentage(
                              (result as any).raw.wins /
                                  (result as any).raw.games -
                                  (result as any).expected
                          ),
                  },
                  {
                      header: "WR",
                      id: "winrate",
                      accessorFn: (result) =>
                          formatPercentage(
                              (result as any).raw.wins /
                                  (result as any).raw.games
                          ),
                  },
                  {
                      header: "Expected",
                      id: "expected",
                      accessorFn: (result) =>
                          formatPercentage((result as any).expected),
                  },
              ] as ColumnDef<EntityMatchupAnalysisResult>[])
            : []),
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

    return (
        <>
            <Table table={table} {...props} />
            <Dialog
                open={confidenceAnalysisModalIsOpen()}
                onOpenChange={setConfidenceAnalysisModalIsOpen}
            >
                <WinrateDecompositionDialog data={chosenResult()!} />
            </Dialog>
        </>
    );
};
