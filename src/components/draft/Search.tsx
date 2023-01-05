import { Icon } from "solid-heroicons";
import { magnifyingGlass } from "solid-heroicons/outline";
import { Accessor, onCleanup, onMount, Setter } from "solid-js";
import { useDraft } from "../../context/DraftContext";

export function Search() {
    const { search, setSearch } = useDraft();

    let inputEl: HTMLInputElement | undefined = undefined;
    const onControlF = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === "f") {
            e.preventDefault();
            inputEl!.focus();
        }
    };
    window.addEventListener("keydown", onControlF);

    onCleanup(() => {
        window.removeEventListener("keydown", onControlF);
    });

    onMount(() => {
        if (!inputEl) return;

        const onTabOrEnter = (e: KeyboardEvent) => {
            if (e.key === "Tab" || e.key === "Enter") {
                e.preventDefault();
                const firstTableRow = document.querySelector("table tbody tr");
                if (firstTableRow) {
                    (firstTableRow as HTMLElement).focus();
                }
            }
        };

        inputEl.addEventListener("keydown", onTabOrEnter);
        onCleanup(() => {
            inputEl!.removeEventListener("keydown", onTabOrEnter);
        });
    });

    return (
        <div class="flex rounded-md flex-1">
            <div class="relative flex flex-grow items-stretch">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon
                        path={magnifyingGlass}
                        class="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                    />
                </div>
                <input
                    ref={inputEl}
                    class="text-xl py-1 block w-full rounded-md rounded-l-md border-gray-301 pl-10 bg-neutral-800 placeholder:text-neutral-500 text-neutral-100"
                    placeholder="SEARCH"
                    value={search()}
                    onInput={(e) => setSearch(e.currentTarget.value)}
                />
            </div>
        </div>
    );
}
