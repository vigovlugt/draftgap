import { For } from "solid-js";
import { useDraft } from "../context/DraftContext";
import { RoleIcon } from "./icons/roles/RoleIcon";

export default function DraftTable() {
    const {
        allySuggestions,
        opponentSuggestions,
        dataset,
        selection,
        pickChampion,
    } = useDraft()!;

    const suggestions = () =>
        selection.team === "opponent"
            ? opponentSuggestions()
            : allySuggestions();

    function makePick(key: string) {
        if (!selection.team) {
            return;
        }

        pickChampion(selection.team, selection.index, key);
    }

    return (
        <table class="min-w-full divide-y divide-neutral-700 ">
            <thead class="bg-[#101010]">
                <tr>
                    <th scope="col" class="py-3 px-4 text-left font-normal">
                        Role
                    </th>
                    <th scope="col" class="py-3 px-4 text-left font-normal">
                        Name
                    </th>
                    <th scope="col" class="py-3 px-4 text-left font-normal">
                        Winrate
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-neutral-800 bg-primary">
                <For each={suggestions()}>
                    {(suggestion) => (
                        <tr
                            onclick={() => makePick(suggestion.championKey)}
                            class="cursor-pointer"
                        >
                            <td class="whitespace-nowrap py-3 px-4 font-medium">
                                <RoleIcon role={suggestion.role} class="h-8" />
                            </td>
                            <td class="whitespace-nowrap py-3 px-4 font-medium">
                                {dataset()![
                                    suggestion.championKey
                                ].name.toUpperCase()}{" "}
                            </td>
                            <td class="whitespace-nowrap py-3 px-4 font-medium">
                                {parseFloat(
                                    (
                                        suggestion.draftResult.winrate * 100
                                    ).toFixed(2)
                                )}
                            </td>
                        </tr>
                    )}
                </For>
            </tbody>
        </table>
    );
}
