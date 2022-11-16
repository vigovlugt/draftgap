import { For } from "solid-js";
import { useDraft } from "../context/DraftContext";

export default function DraftTable() {
    const { suggestions, dataset } = useDraft()!;

    return (
        <table class="min-w-full divide-y divide-neutral-700 ">
            <thead class="bg-[#101010]">
                <tr>
                    <th
                        scope="col"
                        class="py-3 px-4 text-left font-normal  sm:pl-6"
                    >
                        Name
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-neutral-800 bg-primary">
                <For each={suggestions()}>
                    {(suggestion) => (
                        <tr>
                            <td class="whitespace-nowrap py-3 px-4 font-medium  sm:pl-6">
                                {suggestion.role}{" "}
                                {dataset()![suggestion.championKey].name}{" "}
                                {suggestion.winrate}
                            </td>
                        </tr>
                    )}
                </For>
            </tbody>
        </table>
    );
}
