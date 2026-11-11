import { For } from "solid-js";
import { Icon } from "solid-heroicons";
import { arrowDown, arrowUp, arrowsUpDown } from "solid-heroicons/solid-mini";
import { displayNameByRole } from "@draftgap/core/src/models/Role";
import { DATASET_TIER_NAME } from "@draftgap/core/src/models/dataset/Dataset";
import {
    ChampionPatchChange,
    PatchChangeType,
} from "@draftgap/core/src/models/dataset/PatchChange";
import { useDataset } from "../../contexts/DatasetContext";
import { cn } from "../../utils/style";
import { formatPatch } from "../../utils/strings";
import { tooltip } from "../../directives/tooltip";
// eslint-disable-next-line
tooltip;

const PATCH_CHANGE_DISPLAY = {
    buff: { label: "Buffed", icon: arrowUp, class: "text-green-500" },
    nerf: { label: "Nerfed", icon: arrowDown, class: "text-red-500" },
    adjusted: {
        label: "Adjusted",
        icon: arrowsUpDown,
        class: "text-yellow-500",
    },
} satisfies Record<PatchChangeType, object>;

type Props = {
    championKey: string;
    class?: string;
};

function PatchChangeTooltip(props: { change: ChampionPatchChange }) {
    const display = () => PATCH_CHANGE_DISPLAY[props.change.type];

    return (
        <div class="flex flex-col gap-1">
            <span>
                <span class={display().class}>{display().label}</span> in patch{" "}
                {formatPatch(props.change.patch)}
            </span>
            <span class="text-neutral-400 text-xs">
                {DATASET_TIER_NAME} winrate in that patch, compared to the
                patch before
            </span>
            <table style={{ "font-variant-numeric": "tabular-nums" }}>
                <tbody>
                    <For each={props.change.roleStats}>
                        {(stats) => (
                            <tr>
                                <td class="pr-3">
                                    {displayNameByRole[stats.role]}
                                </td>
                                <td class="pr-3 text-right">
                                    {stats.winrate.toFixed(2)}%
                                </td>
                                <td
                                    class="text-right"
                                    classList={{
                                        "text-green-500": stats.delta > 0,
                                        "text-red-500": stats.delta < 0,
                                    }}
                                >
                                    {stats.delta > 0 ? "+" : ""}
                                    {stats.delta.toFixed(2)}
                                </td>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>
        </div>
    );
}

// Shows whether the champion was buffed, nerfed or adjusted in the period of the dataset
export function PatchChangeIndicator(props: Props) {
    const { dataset } = useDataset();

    const changes = () => dataset()?.patchChanges?.[props.championKey] ?? [];

    return (
        <For each={changes()}>
            {(change) => (
                <span
                    class={cn(
                        "inline-flex shrink-0 items-center",
                        PATCH_CHANGE_DISPLAY[change.type].class,
                        props.class,
                    )}
                    // @ts-ignore
                    use:tooltip={{
                        content: <PatchChangeTooltip change={change} />,
                    }}
                >
                    <Icon
                        path={PATCH_CHANGE_DISPLAY[change.type].icon}
                        class="w-4 h-4"
                    />
                </span>
            )}
        </For>
    );
}
