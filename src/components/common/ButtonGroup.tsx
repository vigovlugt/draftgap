import { Accessor, For, JSX } from "solid-js";

export type ButtonGroupOption<T> = {
    label: JSX.Element;
    value: T;
};

interface Props<T> {
    options: ButtonGroupOption<T>[];
    selected: Accessor<T>;
    onChange: (value: T) => void;
}

export function ButtonGroup<T>({
    options,
    selected,
    onChange,
    ...props
}: Props<T> & Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange">) {
    return (
        <div
            {...props}
            class={`isolate inline-flex rounded-md shadow-sm ${props.class}`}
        >
            <For each={options}>
                {(option, i) => (
                    <button
                        type="button"
                        class="uppercase leading-4 relative inline-flex items-center border text-neutral-300 border-neutral-700 bg-primary px-3 font-medium hover:bg-neutral-800 focus:z-10 py-3"
                        classList={{
                            "rounded-r-md": i() === options.length - 1,
                            "rounded-l-md": i() === 0,
                            "-ml-px": i() !== 0,
                            "text-white !bg-neutral-700":
                                selected() === option.value,
                        }}
                        onClick={() => onChange(option.value)}
                    >
                        {option.label}
                    </button>
                )}
            </For>
        </div>
    );
}
