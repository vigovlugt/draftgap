import { For } from "solid-js";
import { cn } from "../../utils/style";

type Props<T> = {
    tabs: readonly {
        value: T;
        label: string;
    }[];
    selected: T;
    onChange: (tab: T) => void;
    class?: string;
    equals?: (a: T, b: T) => boolean;
};

export const ViewTabs = <T,>(props: Props<T>) => {
    return (
        <div
            class={cn(
                "bg-primary w-full border-b border-neutral-700",
                props.class
            )}
        >
            <For each={props.tabs}>
                {(tab) => (
                    <button
                        class={cn(
                            "px-4 py-3 text-neutral-500 uppercase font-semibold",
                            {
                                "text-neutral-50": props.equals
                                    ? props.equals(tab.value, props.selected)
                                    : tab.value === props.selected,
                            }
                        )}
                        onClick={() => props.onChange(tab.value)}
                    >
                        {tab.label}
                    </button>
                )}
            </For>
        </div>
    );
};
