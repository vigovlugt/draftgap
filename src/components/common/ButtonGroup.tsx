import { Accessor, For, JSX, Setter } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { Role, ROLES } from "../../lib/models/Role";
import { RoleIcon } from "../icons/roles/RoleIcon";

interface Props<T> {
    options: { label: JSX.Element; value: T }[];
    selected: Accessor<T>;
    onChange: (value: T) => void;
}

export function ButtonGroup<T>({
    options,
    selected,
    onChange,
    ...props
}: Props<T> & JSX.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            class={`isolate inline-flex rounded-md shadow-sm ${props.class}`}
        >
            <For each={options}>
                {(option, i) => (
                    <button
                        type="button"
                        class="text-2xl leading-3 relative inline-flex items-center border text-neutral-300 border-neutral-700 bg-primary px-3 font-medium hover:bg-neutral-800 focus:z-10"
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
