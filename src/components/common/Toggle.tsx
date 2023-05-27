import { Accessor, JSX } from "solid-js";
import { Toggle as HToggle } from "solid-headless";

interface Props {
    isChecked: boolean;
    onChange: () => unknown;
}

export function Toggle(
    props: JSX.InputHTMLAttributes<HTMLInputElement> & Props
) {
    return (
        <HToggle
            pressed={props.isChecked}
            onChange={props.onChange}
            class="relative inline-flex h-6 w-11 bg-neutral-700 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
            classList={{
                "!bg-secondary": props.isChecked,
            }}
        >
            <span
                aria-hidden="true"
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white neutral-900 shadow ring-0 transition duration-200 ease-in-out"
                classList={{
                    "translate-x-5": props.isChecked,
                    "translate-x-0": !props.isChecked,
                }}
            />
        </HToggle>
    );
}
