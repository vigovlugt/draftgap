import { For, JSX, Match, Switch, createSignal } from "solid-js";

type Props<T> = {
    data: T[];
    getGames: (item: T) => number;
    getRating: (item: T) => number;
    children: (data: readonly [T, number, number]) => JSX.Element;
};

export const useEntityStats = <T,>(props: Props<T>) => {
    const [currentSort, setCurrentSort] = createSignal<
        | "rating-asc"
        | "rating-desc"
        | "pickrate-asc"
        | "pickrate-desc"
        | undefined
    >(undefined);

    const data = () => {
        switch (currentSort()) {
            case "rating-asc":
                return props.data.sort(
                    (a, b) => props.getRating(a) - props.getRating(b)
                );
            case "rating-desc":
            default:
                return props.data.sort(
                    (a, b) => props.getRating(b) - props.getRating(a)
                );
            case "pickrate-asc":
                return props.data.sort(
                    (a, b) => props.getGames(a) - props.getGames(b)
                );
            case "pickrate-desc":
                return props.data.sort(
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

    return {
        currentSort,
        onSortClick,
        data,
    };
};

export const HorizontalEntityStats = <T,>(props: Props<T>) => {
    const { currentSort, onSortClick, data } = useEntityStats(props);

    return (
        <div class="flex gap-4 p-3 bg-[#141414] rounded-md items-end h-full">
            <div class="flex flex-col text-sm -mr-3 shrink-0">
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
            <div class="flex gap-4 overflow-x-auto w-full">
                <For
                    each={data().map(
                        (d) =>
                            [d, props.getGames(d), props.getRating(d)] as const
                    )}
                >
                    {props.children}
                </For>
            </div>
        </div>
    );
};

export const VerticalEntityStats = <T,>(props: Props<T>) => {
    const { currentSort, onSortClick, data } = useEntityStats(props);

    return (
        <table class="bg-[#141414] rounded-md">
            <thead class="text-sm">
                <tr>
                    <th />
                    <th class="text-left uppercase pt-3 font-normal">
                        <button
                            onClick={() => onSortClick("rating")}
                            class="text-left uppercase"
                        >
                            <Switch
                                fallback={<span class="opacity-0"> ▲</span>}
                            >
                                <Match when={currentSort() === "rating-asc"}>
                                    {" "}
                                    ▲
                                </Match>
                                <Match when={currentSort() === "rating-desc"}>
                                    {" "}
                                    ▼
                                </Match>
                            </Switch>
                            Winrate
                        </button>
                    </th>
                    <th class="text-left uppercase pr-3 pt-3 font-normal">
                        <button
                            onClick={() => onSortClick("pickrate")}
                            class="text-left uppercase"
                        >
                            <Switch
                                fallback={<span class="opacity-0"> ▲</span>}
                            >
                                <Match when={currentSort() === "pickrate-asc"}>
                                    {" "}
                                    ▲
                                </Match>
                                <Match when={currentSort() === "pickrate-desc"}>
                                    {" "}
                                    ▼
                                </Match>
                            </Switch>
                            Pickrate
                        </button>
                    </th>
                </tr>
            </thead>
            <tbody>
                <For
                    each={data().map(
                        (d) =>
                            [d, props.getGames(d), props.getRating(d)] as const
                    )}
                >
                    {props.children}
                </For>
            </tbody>
        </table>
    );
};
