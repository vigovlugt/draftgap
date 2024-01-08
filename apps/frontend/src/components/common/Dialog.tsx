import { Dialog as DialogPrimitives } from "@kobalte/core";
import { ComponentProps, Show } from "solid-js";
import { cn } from "../../utils/style";
import { Icon } from "solid-heroicons";
import { xMark } from "solid-heroicons/solid";

export const Dialog = DialogPrimitives.Root;

export const DialogTrigger = DialogPrimitives.Trigger;

function DialogPortal(props: ComponentProps<typeof DialogPrimitives.Portal>) {
    return (
        <DialogPrimitives.Portal {...props}>
            <div class="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
                {props.children}
            </div>
        </DialogPrimitives.Portal>
    );
}

function DialogOverlay(props: ComponentProps<typeof DialogPrimitives.Overlay>) {
    return (
        <DialogPrimitives.Overlay
            {...props}
            class={cn(
                "fixed inset-0 bg-black bg-opacity-40 transition-opacity",
                props.class
            )}
        />
    );
}

export function DialogContent(
    props: ComponentProps<typeof DialogPrimitives.Content> & {
        canClose?: boolean;
    }
) {
    return (
        <DialogPortal>
            <DialogOverlay class="ui-expanded:animate-enter animate-leave !scale-100" />
            <DialogPrimitives.Content
                {...props}
                class={cn(
                    "fixed z-50 grid w-full gap-4 rounded-lg bg-primary p-6 shadow-lg max-w-lg sm:rounded-lg border border-white/10 max-h-[calc(100%-4rem)] overflow-y-auto animate-dialog-leave ui-expanded:animate-dialog-enter",
                    props.class
                )}
            >
                {props.children}
                <Show when={props.canClose ?? true}>
                    <DialogPrimitives.CloseButton class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none">
                        <Icon path={xMark} class="h-[24px] text-neutral-400" />
                    </DialogPrimitives.CloseButton>
                </Show>
            </DialogPrimitives.Content>
        </DialogPortal>
    );
}

export function DialogHeader(props: ComponentProps<"div">) {
    return (
        <div
            {...props}
            class={cn(
                "flex flex-col space-y-1.5 text-center sm:text-left",
                props.class
            )}
        >
            {props.children}
        </div>
    );
}

export function DialogFooter(props: ComponentProps<"div">) {
    return (
        <div
            {...props}
            class={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
                props.class
            )}
        >
            {props.children}
        </div>
    );
}

export function DialogTitle(
    props: ComponentProps<typeof DialogPrimitives.Title>
) {
    return (
        <DialogPrimitives.Title
            {...props}
            class={cn(
                "text-4xl uppercase font-medium leading-none",
                props.class
            )}
        >
            {props.children}
        </DialogPrimitives.Title>
    );
}

export function DialogDescription(
    props: ComponentProps<typeof DialogPrimitives.Description>
) {
    return (
        <DialogPrimitives.Description
            {...props}
            class={cn("text-sm text-neutral-400", props.class)}
        >
            {props.children}
        </DialogPrimitives.Description>
    );
}
