import { For } from "solid-js";

type Props<T extends any> = {
    tabs: {
        value: T;
        label: string;
    }[];
    selected: T;
    onChange: (tab: T) => void;
    className?: string;
    equals?: (a: T, b: T) => boolean;
};

export const ViewTabs = <T extends any>(props: Props<T>) => {
    return (
        <div
            class={
                "bg-primary w-full border-b border-neutral-700 " +
                props.className
            }
        >
            <For each={props.tabs}>
                {(tab) => (
                    <button
                        class="p-4 py-3 text-neutral-500 uppercase font-semibold"
                        classList={{
                            "text-neutral-50": props.equals
                                ? props.equals(tab.value, props.selected)
                                : tab.value === props.selected,
                        }}
                        onClick={() => props.onChange(tab.value)}
                    >
                        {tab.label}
                    </button>
                )}
            </For>
        </div>
    );
};
