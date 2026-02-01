import { Popover as PopoverPrimitive } from "@kobalte/core";
import { ComponentProps } from "solid-js";
import { cn } from "../../utils/style";

export const Popover = PopoverPrimitive.Root;

export const PopoverTrigger = PopoverPrimitive.Trigger;

type PopoverContentProps = ComponentProps<typeof PopoverPrimitive.Content>;

export function PopoverContent(props: PopoverContentProps) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                class={cn(
                    "z-50 w-72 rounded-md border border-white/10 bg-neutral-800 p-4 shadow-md outline-hidden animate-leave ui-expanded:animate-enter ",
                    props.class,
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
}
