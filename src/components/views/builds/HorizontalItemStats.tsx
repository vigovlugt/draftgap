import { Component, For, JSX, Match, Switch, createSignal } from "solid-js";
import { createAutoAnimateDirective } from "@formkit/auto-animate/solid";

type Props<T> = {
    items: T[];
    getGames: (item: T) => number;
    getRating: (item: T) => number;
    children: (item: T) => JSX.Element;
};

export const HorizontalItemStats = <T,>(props: Props<T>) => {
    const [currentSort, setCurrentSort] = createSignal<
        | "rating-asc"
        | "rating-desc"
        | "pickrate-asc"
        | "pickrate-desc"
        | undefined
    >(undefined);

    const items = () => {
        switch (currentSort()) {
            case "rating-asc":
                return props.items.sort(
                    (a, b) => props.getRating(a) - props.getRating(b)
                );
            case "rating-desc":
                return props.items.sort(
                    (a, b) => props.getRating(b) - props.getRating(a)
                );
            case "pickrate-asc":
                return props.items.sort(
                    (a, b) => props.getGames(a) - props.getGames(b)
                );
            case "pickrate-desc":
            default:
                return props.items.sort(
                    (a, b) => props.getGames(b) - props.getGames(a)
                );
        }
    };

    const onSortClick = (sort: "rating" | "pickrate") => {
        if (currentSort() === `${sort}-asc`) {
            setCurrentSort(undefined);
            return;
        } else if (currentSort() === `${sort}-desc`) {
            setCurrentSort(`${sort}-asc`);
            return;
        }

        setCurrentSort(`${sort}-desc`);
    };

    const autoAnimate = createAutoAnimateDirective();
    autoAnimate;

    return (
        <div
            class="flex gap-4 p-2 bg-[#141414] rounded-md"
            use:autoAnimate={{
                duration: 150,
                easing: "linear",
            }}
        >
            <div class="flex flex-col gap-1 text-sm -mr-3 shrink-0">
                <div class="h-12 w-12" />
                <button
                    onClick={() => onSortClick("rating")}
                    class="text-left uppercase"
                >
                    Winrate
                    <Switch fallback={<span class="opacity-0"> ◀</span>}>
                        <Match when={currentSort() === "rating-asc"}> ◀</Match>
                        <Match when={currentSort() === "rating-desc"}> ▶</Match>
                    </Switch>
                </button>
                <button
                    onClick={() => onSortClick("pickrate")}
                    class="text-left uppercase"
                >
                    Pickrate
                    <Switch fallback={<span class="opacity-0"> ◀</span>}>
                        <Match when={currentSort() === "pickrate-asc"}>
                            {" "}
                            ◀
                        </Match>
                        <Match when={currentSort() === "pickrate-desc"}>
                            {" "}
                            ▶
                        </Match>
                    </Switch>
                </button>
            </div>
            <div class="flex gap-4 overflow-x-auto">
                <For each={items()}>{props.children}</For>
            </div>
        </div>
    );
};