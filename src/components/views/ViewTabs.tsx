import { For } from "solid-js";

type Props<T extends string> = {
    tabs: {
        value: T;
        label: string;
    }[];
    selected: T;
    onChange: (tab: T) => void;
    className?: string;
};

export const ViewTabs = <T extends string>(props: Props<T>) => {
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
                        class="p-4 py-4 text-neutral-500 uppercase font-semibold"
                        classList={{
                            "text-neutral-50": tab.value === props.selected,
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
