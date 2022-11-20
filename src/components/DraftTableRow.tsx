import { createDraggable } from "@thisbeyond/solid-dnd";
import { useDraft } from "../context/DraftContext";
import { Suggestion } from "../lib/suggestions/suggestions";
import { RoleIcon } from "./icons/roles/RoleIcon";

interface Props {
    suggestion: Suggestion;
}

export function DraftTableRow({ suggestion }: Props) {
    const { dataset, selection, pickChampion } = useDraft();
    const draggable = createDraggable(
        suggestion.championKey + ":" + suggestion.role,
        {
            suggestion,
        }
    );

    function makePick(key: string) {
        if (!selection.team) {
            return;
        }

        pickChampion(selection.team, selection.index, key);
    }

    return (
        <tr
            use:draggable
            onclick={() => makePick(suggestion.championKey)}
            class="cursor-grab hover:bg-neutral-800 transition-colors duration-150 ease-in-out"
        >
            <td class="whitespace-nowrap py-3 px-4 font-medium">
                <RoleIcon role={suggestion.role} class="h-8" />
            </td>
            <td class="whitespace-nowrap py-3 px-4 font-medium">
                {dataset()![suggestion.championKey].name.toUpperCase()}
            </td>
            <td class="whitespace-nowrap py-3 px-4 font-medium">
                {parseFloat((suggestion.draftResult.winrate * 100).toFixed(2))}
            </td>
        </tr>
    );
}
