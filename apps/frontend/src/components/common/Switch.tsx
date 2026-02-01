import { ComponentProps } from "solid-js";
import { Switch as SwitchPrimitives } from "@kobalte/core";
import { cn } from "../../utils/style";

export function Switch(props: ComponentProps<typeof SwitchPrimitives.Root>) {
    return (
        <SwitchPrimitives.Root
            {...props}
            class={cn(
                "relative inline-flex h-6 w-11 bg-neutral-700 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out hover:bg-neutral-600",
                {
                    "bg-secondary hover:bg-secondary": props.checked,
                },
                props.class,
            )}
        >
            <SwitchPrimitives.Input />
            <SwitchPrimitives.Control class="w-full">
                <SwitchPrimitives.Thumb
                    aria-hidden="true"
                    class={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white neutral-900 shadow-sm ring-0 transition duration-200 ease-in-out",
                        {
                            "translate-x-5": props.checked,
                            "translate-x-0": !props.checked,
                        },
                    )}
                />
            </SwitchPrimitives.Control>
        </SwitchPrimitives.Root>
    );
}
