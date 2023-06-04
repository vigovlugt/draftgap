import { For, JSX, mergeProps, splitProps } from "solid-js";
import { cn } from "../../utils/style";

export type ButtonGroupOption<T> = {
    label: JSX.Element;
    value: T;
};

interface Props<T> {
    options: readonly ButtonGroupOption<T>[];
    selected: T;
    onChange: (value: T) => void;
    size?: "sm" | "md";
}

export function ButtonGroup<T>(
    _props: Props<T> & Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange">
) {
    const mergedProps = mergeProps({ size: "md" }, _props);
    const [props, externalProps] = splitProps(mergedProps, [
        "options",
        "selected",
        "onChange",
        "size",
    ]);
    return (
        <div
            {...externalProps}
            class={cn(
                "isolate inline-flex rounded-md shadow-sm ",
                externalProps.class
            )}
        >
            <For each={props.options}>
                {(option, i) => (
                    <button
                        type="button"
                        class={cn(
                            "uppercase leading-4 relative inline-flex items-center border text-neutral-300 border-neutral-700 bg-primary px-3 font-medium hover:bg-neutral-600 focus:z-10 py-3",
                            {
                                "rounded-r-md":
                                    i() === props.options.length - 1,
                                "rounded-l-md": i() === 0,
                                "-ml-px": i() !== 0,
                                "text-white bg-neutral-700":
                                    props.selected === option.value,
                                "py-2": props.size === "sm",
                            }
                        )}
                        onClick={() => props.onChange(option.value)}
                    >
                        {option.label}
                    </button>
                )}
            </For>
        </div>
    );
}
