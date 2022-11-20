import { Accessor, For } from "solid-js";
import { useDraft } from "../context/DraftContext";
import { Role } from "../lib/models/Role";
import { DraftTableRow } from "./DraftTableRow";

export default function DraftTable() {
    const {
        allySuggestions,
        opponentSuggestions,
        dataset,
        selection,
        search,
        roleFilter,
    } = useDraft()!;

    const suggestions = () =>
        selection.team === "opponent"
            ? opponentSuggestions()
            : allySuggestions();

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
                    .championData[s.championKey].name.replaceAll(
                        /[^a-zA-Z0-9]/g,
                        ""
                    )
                    .toLowerCase()
                    .includes(str)
            );
        }

        if (roleFilter() !== undefined) {
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
                        class="pl-4 py-3 px-2 text-left font-normal uppercase"
                    >
                        Role
                    </th>
                    <th
                        scope="col"
                        class="py-3 px-2 text-left font-normal uppercase w-full"
                    >
                        Champion
                    </th>
                    <th
                        scope="col"
                        class="pr-4 py-3 px-2 text-left font-normal uppercase w-full"
                    >
                        Winrate
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-neutral-800 bg-primary">
                <For each={filteredSuggestions()}>
                    {(suggestion) => <DraftTableRow suggestion={suggestion} />}
                </For>
            </tbody>
        </table>
    );
}
