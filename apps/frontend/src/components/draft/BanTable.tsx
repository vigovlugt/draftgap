import {
    ColumnDef,
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    Row,
    SortingState,
} from "@tanstack/solid-table";
import { createSignal, For, JSXElement, Show } from "solid-js";
import { BanRoleThreat, BanSuggestion } from "@draftgap/core/src/draft/bans";
import { displayNameByRole, Role } from "@draftgap/core/src/models/Role";
import { useDraft } from "../../contexts/DraftContext";
import { useDataset } from "../../contexts/DatasetContext";
import { useDraftFilters } from "../../contexts/DraftFiltersContext";
import { useDraftSuggestions } from "../../contexts/DraftSuggestionsContext";
import { useUser } from "../../contexts/UserContext";
import { createTableKeyboardNavigation } from "../../hooks/createTableKeyboardNavigation";
import { championMatchesSearch } from "../../utils/search";
import { focusSearch } from "./Search";
import { createMustSelectToast } from "../../utils/toast";
import { formatPercentage } from "../../utils/rating";
import { tooltip } from "../../directives/tooltip";
import { Table } from "../common/Table";
import ChampionCell from "../common/ChampionCell";
import { RoleIcon } from "../icons/roles/RoleIcon";
import { ChampionContextMenuContent } from "./ChampionContextMenu";
// eslint-disable-next-line
tooltip;

const DISPLAY_EPSILON = 0.00005;

function formatPoints(value: number) {
    const sign =
        value > DISPLAY_EPSILON ? "+" : value < -DISPLAY_EPSILON ? "-" : "";
    return `${sign}${formatPercentage(Math.abs(value))}`;
}

function pointsClass(value: number) {
    if (value > DISPLAY_EPSILON) return "text-winrate-good";
    if (value < -DISPLAY_EPSILON) return "text-winrate-meh";
    return "text-neutral-400";
}

function HeaderWithTooltip(props: { label: string; tooltip: JSXElement }) {
    return (
        <span
            // @ts-ignore
            use:tooltip={{ content: props.tooltip }}
        >
            {props.label}
        </span>
    );
}

function ThreatBreakdown(props: { threats: BanRoleThreat[] }) {
    return (
        <div class="flex flex-col gap-1 text-base normal-case">
            <span class="text-neutral-400">
                Expected enemy winrate removed by role
            </span>
            <For each={props.threats}>
                {(t) => (
                    <div class="flex items-center gap-2">
                        <RoleIcon role={t.role} class="h-5" />
                        <span class="w-20">{displayNameByRole[t.role]}</span>
                        <span class="w-24 text-neutral-400">
                            {formatPercentage(t.probability, 1)}% pick
                        </span>
                        <span class={`w-20 ${pointsClass(t.delta)}`}>
                            {formatPoints(t.delta)} WR
                        </span>
                        <span class={pointsClass(Math.max(0, t.threat))}>
                            {formatPoints(Math.max(0, t.threat))}
                        </span>
                    </div>
                )}
            </For>
        </div>
    );
}

const ROLE_ICON_SIZE = 32;

function ThreatRoles(props: { roles: Role[] }) {
    const secondaryRoles = () => props.roles.slice(1);
    const secondarySize = () =>
        ROLE_ICON_SIZE / Math.max(2, secondaryRoles().length);

    return (
        <div class="flex items-center gap-0.5">
            <RoleIcon
                role={props.roles[0]!}
                style={{ height: `${ROLE_ICON_SIZE}px` }}
            />
            <Show when={secondaryRoles().length > 0}>
                <div
                    class="flex flex-col justify-center"
                    style={{ height: `${ROLE_ICON_SIZE}px` }}
                >
                    <For each={secondaryRoles()}>
                        {(role) => (
                            <RoleIcon
                                role={role}
                                class="opacity-75"
                                style={{ height: `${secondarySize()}px` }}
                            />
                        )}
                    </For>
                </div>
            </Show>
        </div>
    );
}

export default function BanTable() {
    const { dataset } = useDataset();
    const { config } = useUser();
    const { selection, select, banChampion } = useDraft();
    const { search } = useDraftFilters();
    const { banSuggestions } = useDraftSuggestions();

    const filteredSuggestions = () => {
        let filtered = banSuggestions();

        if (search()) {
            filtered = filtered.filter((s) =>
                championMatchesSearch(
                    dataset()!.championData[s.championKey],
                    search(),
                    config,
                ),
            );
        }

        return filtered;
    };

    const mainThreat = (suggestion: BanSuggestion) => suggestion.threats[0]!;

    const columns: ColumnDef<BanSuggestion>[] = [
        {
            id: "role",
            header: () => (
                <HeaderWithTooltip
                    label="Roles"
                    tooltip="Roles in which banning this champion removes enemy winrate, main role first. The other columns are for the main role"
                />
            ),
            accessorFn: (suggestion) => mainThreat(suggestion).role,
            cell: (info) => (
                <ThreatRoles
                    roles={info.row.original.threats.map((t) => t.role)}
                />
            ),
            meta: {
                headerClass: "w-1",
            },
            sortDescFirst: false,
        },
        {
            id: "champion",
            header: "Champion",
            accessorFn: (suggestion) => suggestion.championKey,
            cell: (info) => (
                <ChampionCell championKey={info.getValue<string>()} />
            ),
            sortingFn: (a, b, id) =>
                dataset()!.championData[
                    a.getValue<string>(id)
                ].name.localeCompare(
                    dataset()!.championData[b.getValue<string>(id)].name,
                ),
        },
        {
            id: "pickrate",
            header: () => (
                <HeaderWithTooltip
                    label="Pickrate"
                    tooltip="Chance the enemy picks this champion in this role, based on pickrate"
                />
            ),
            accessorFn: (suggestion) => mainThreat(suggestion).probability,
            cell: (info) => (
                <div class="flex justify-end text-neutral-300">
                    {formatPercentage(info.getValue<number>(), 1)}
                </div>
            ),
        },
        {
            id: "delta",
            header: () => (
                <HeaderWithTooltip
                    label="Winrate"
                    tooltip="Enemy winrate with this champion compared to their expected winrate in this role"
                />
            ),
            accessorFn: (suggestion) => mainThreat(suggestion).delta,
            cell: (info) => (
                <div
                    class={`flex justify-end ${pointsClass(info.getValue<number>())}`}
                    style={{ "font-variant-numeric": "tabular-nums" }}
                >
                    {formatPoints(info.getValue<number>())}
                </div>
            ),
        },
        {
            id: "score",
            header: () => (
                <HeaderWithTooltip
                    label="Ban value"
                    tooltip="Expected enemy winrate removed by banning this champion: how much better it does in this draft than their alternatives, weighted by how likely they pick it"
                />
            ),
            accessorFn: (suggestion) => suggestion.score,
            cell: (info) => (
                <div
                    class={`flex justify-end ${pointsClass(info.getValue<number>())}`}
                    style={{ "font-variant-numeric": "tabular-nums" }}
                >
                    <span
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <ThreatBreakdown
                                    threats={info.row.original.threats}
                                />
                            ),
                        }}
                    >
                        {formatPoints(info.getValue<number>())}
                    </span>
                </div>
            ),
        },
    ];

    const [sorting, setSorting] = createSignal<SortingState>([]);
    const table = createSolidTable({
        get data() {
            return filteredSuggestions();
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

    function ban(row: Row<BanSuggestion>, e: MouseEvent | KeyboardEvent) {
        if (!selection.team) {
            createMustSelectToast();
            return;
        }

        banChampion(selection.team, selection.index, row.original.championKey);

        if (e instanceof KeyboardEvent) {
            focusSearch();
        }
    }

    createTableKeyboardNavigation("ban-table", (team) =>
        select(team, undefined, { type: "ban" }),
    );

    return (
        <Table
            table={table}
            onClickRow={ban}
            rowContextMenu={(row) => (
                <ChampionContextMenuContent
                    championKey={row.original.championKey}
                    role={mainThreat(row.original).role}
                />
            )}
            id="ban-table"
        />
    );
}
