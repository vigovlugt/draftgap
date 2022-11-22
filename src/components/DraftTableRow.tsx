import { createDraggable, useDragDropContext } from "@thisbeyond/solid-dnd";
import { createEffect, createSignal } from "solid-js";
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

    function pick() {
        if (!selection.team) {
            return;
        }

        pickChampion(
            selection.team,
            selection.index,
            suggestion.championKey,
            suggestion.role
        );
    }

    return (
        <tr
            // @ts-ignore
            use:draggable
            onClick={() => pick()}
            class="cursor-pointer hover:bg-neutral-800 transition-colors duration-150 ease-in-out"
        >
            <td class="whitespace-nowrap py-3 px-2 pl-4 font-medium">
                <RoleIcon role={suggestion.role} class="h-8" />
            </td>
            <td class="whitespace-nowrap py-3 px-2 font-medium">
                <div class="flex space-x-2">
                    <img
                        src={`https://ddragon.leagueoflegends.com/cdn/${
                            dataset()!.version
                        }/img/champion/${
                            dataset()!.championData[suggestion.championKey].id
                        }.png`}
                        loading="lazy"
                        class="h-9 w-9"
                    ></img>
                    <span>
                        {dataset()!.championData[
                            suggestion.championKey
                        ].name.toUpperCase()}
                    </span>
                </div>
            </td>
            <td class="whitespace-nowrap py-3 px-2 pr-4 font-medium">
                {parseFloat((suggestion.draftResult.winrate * 100).toFixed(2))}
            </td>
        </tr>
    );
}
