import { DropdownMenu as DropdownMenuPrimitive } from "@kobalte/core";

import { cn } from "../../utils/style";
import { ComponentProps } from "solid-js";
import { Icon } from "solid-heroicons";
import { chevronRight } from "solid-heroicons/solid";
import { check, checkCircle } from "solid-heroicons/solid-mini";

export const DropdownMenu = DropdownMenuPrimitive.Root;

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export function DropdownMenuSubTrigger(
    props: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
        inset?: boolean;
    },
) {
    return (
        <DropdownMenuPrimitive.SubTrigger
            {...props}
            class={cn(
                "relative flex select-none items-center px-3 py-1.5 text-lg outline-hidden hover:bg-neutral-700 transition-colors ui-disabled:pointer-events-none ui-disabled:opacity-50 uppercase",
                {
                    "pl-8": props.inset,
                },
                props.class,
            )}
        >
            {props.children}
            <Icon
                path={chevronRight}
                class="ml-auto h-4 w-4 -mr-[2px]"
                stroke-width={2}
                stroke="currentColor"
            />
        </DropdownMenuPrimitive.SubTrigger>
    );
}

export function DropdownMenuSubContent(
    props: ComponentProps<typeof DropdownMenuPrimitive.SubContent>,
) {
    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.SubContent
                {...props}
                class={cn(
                    "z-50 min-w-32 overflow-hidden rounded-md border border-white/10 bg-neutral-800 py-1.5 animate-leave ui-expanded:animate-enter",
                    props.class,
                )}
            >
                {props.children}
            </DropdownMenuPrimitive.SubContent>
        </DropdownMenuPrimitive.Portal>
    );
}

export function DropdownMenuContent(
    props: ComponentProps<typeof DropdownMenuPrimitive.Content>,
) {
    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
                {...props}
                class={cn(
                    "z-50 min-w-32 overflow-hidden rounded-md border border-white/10 bg-neutral-800 py-1.5 animate-leave ui-expanded:animate-enter",
                    props.class,
                )}
            >
                {props.children}
            </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
    );
}

export function DropdownMenuItem(
    props: ComponentProps<typeof DropdownMenuPrimitive.Item> & {
        inset?: boolean;
    },
) {
    return (
        <DropdownMenuPrimitive.Item
            {...props}
            class={cn(
                "relative flex select-none items-center px-3 py-1.5 text-lg outline-hidden hover:bg-neutral-700 transition-colors ui-disabled:pointer-events-none ui-disabled:opacity-50 uppercase",
                {
                    "pl-8": props.inset,
                },
                props.class,
            )}
        >
            {props.children}
        </DropdownMenuPrimitive.Item>
    );
}

export function DropdownMenuCheckboxItem(
    props: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>,
) {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            {...props}
            class={cn(
                "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-lg outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground ui-disabled:pointer-events-none ui-disabled:opacity-50",
                props.class,
            )}
        >
            <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <Icon path={check} class="h-4 w-4" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
        </DropdownMenuPrimitive.CheckboxItem>
    );
}

export function DropdownMenuRadioItem(
    props: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>,
) {
    return (
        <DropdownMenuPrimitive.RadioItem
            {...props}
            class={cn(
                "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-lg outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground ui-disabled:pointer-events-none ui-disabled:opacity-50",
                props.class,
            )}
        >
            <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <Icon path={checkCircle} class="h-2 w-2 fill-current" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {props.children}
        </DropdownMenuPrimitive.RadioItem>
    );
}

export function DropdownMenuLabel(
    props: ComponentProps<"label"> & {
        inset?: boolean;
    },
) {
    return (
        <label
            {...props}
            class={cn(
                "px-3 py-1.5 text-lg font-medium uppercase",
                props.inset && "pl-8",
                props.class,
            )}
        >
            {props.children}
        </label>
    );
}

export function DropdownMenuSeparator(
    props: ComponentProps<typeof DropdownMenuPrimitive.Separator>,
) {
    return (
        <DropdownMenuPrimitive.Separator
            {...props}
            class={cn("my-1.5 h-px border-neutral-700", props.class)}
        />
    );
}

export function DropdownMenuShortcut(props: ComponentProps<"span">) {
    return (
        <span
            {...props}
            class={cn(
                "pl-3 ml-auto text-base tracking-widest opacity-60",
                props.class,
            )}
        >
            {props.children}
        </span>
    );
}

export function DropdownMenuIcon(props: ComponentProps<typeof Icon>) {
    return (
        <Icon
            {...props}
            class={cn("mr-3 h-5 w-5 text-neutral-400", props.class)}
        />
    );
}
