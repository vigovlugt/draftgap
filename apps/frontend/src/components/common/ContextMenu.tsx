import { ContextMenu as ContextMenuPrimitive } from "@kobalte/core";
import { ComponentProps } from "solid-js";

import { cn } from "../../utils/style";

export const ContextMenu = ContextMenuPrimitive.Root;

export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

export function ContextMenuContent(
    props: ComponentProps<typeof ContextMenuPrimitive.Content>,
) {
    return (
        <ContextMenuPrimitive.Portal>
            <ContextMenuPrimitive.Content
                {...props}
                class={cn(
                    "z-50 min-w-32 overflow-hidden rounded-md border border-white/10 bg-neutral-800 py-1.5 animate-leave ui-expanded:animate-enter",
                    props.class,
                )}
            >
                {props.children}
            </ContextMenuPrimitive.Content>
        </ContextMenuPrimitive.Portal>
    );
}
