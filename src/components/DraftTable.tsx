import { Accessor, For } from "solid-js";
import { useDraft } from "../context/DraftContext";
import { Role } from "../lib/models/Role";
import { RoleIcon } from "./icons/roles/RoleIcon";

export default function DraftTable({
    search,
    roleFilter,
}: {
    search: Accessor<string>;
    roleFilter: Accessor<Role | undefined>;
}) {
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

    const filteredSuggestions = () => {
        let filtered = suggestions();
        if (!dataset()) {
            return filtered;
        }

        if (search()) {
            const str = search()
                .replaceAll(/[^a-zA-Z0-9]/g, "")
                .toLowerCase();
            filtered = filtered.filter((s) =>
                dataset()!
                    [s.championKey].name.replaceAll(/[^a-zA-Z0-9]/g, "")
                    .toLowerCase()
                    .includes(str)
            );
        }

        if (roleFilter()) {
            filtered = filtered.filter((s) => s.role === roleFilter());
        }

        return filtered;
    };

    return (
        <table class="min-w-full divide-y divide-neutral-700 ">
            <thead class="bg-[#101010]">
                <tr>
                    <th
                        scope="col"
                        class="py-3 px-4 text-left font-normal uppercase"
                    >
                        Role
                    </th>
                    <th
                        scope="col"
                        class="py-3 px-4 text-left font-normal uppercase"
                    >
                        Name
                    </th>
                    <th
                        scope="col"
                        class="py-3 px-4 text-left font-normal uppercase"
                    >
                        Winrate
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-neutral-800 bg-primary">
                <For each={filteredSuggestions()}>
                    {(suggestion) => (
                        <tr
                            onclick={() => makePick(suggestion.championKey)}
                            class="cursor-pointer hover:bg-neutral-800 transition-colors duration-150 ease-in-out"
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
