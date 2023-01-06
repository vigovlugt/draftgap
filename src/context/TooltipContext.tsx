import { Placement } from "@popperjs/core";
import { Transition } from "solid-headless";
import {
    createContext,
    createEffect,
    createSignal,
    JSX,
    Show,
    useContext,
} from "solid-js";
import usePopper from "solid-popper";

export const createTooltipContext = () => {
    const [popoverContent, setPopoverContent] =
        createSignal<JSX.Element | null>("TEST!");
    const [popoverPlacement, setPopoverPlacement] =
        createSignal<Placement>("auto");
    const [popoverTarget, setPopoverTarget] = createSignal<HTMLElement | null>(
        null
    );
    const [popoverVisible, setPopoverVisible] = createSignal(false);

    return {
        popoverContent,
        setPopoverContent,
        popoverPlacement,
        setPopoverPlacement,
        popoverTarget,
        setPopoverTarget,
        popoverVisible,
        setPopoverVisible,
    };
};

export const TooltipContext =
    createContext<ReturnType<typeof createTooltipContext>>();

export function TooltipProvider(props: { children: JSX.Element }) {
    const ctx = createTooltipContext();
    const [popper, setPopper] = createSignal<HTMLDivElement>();

    createEffect(() => {
        usePopper(ctx.popoverTarget, popper, {
            placement: ctx.popoverPlacement(),
            modifiers: [
                {
                    name: "offset",
                    options: {
                        offset: [0, 8],
                    },
                },
            ],
        });
    });

    return (
        <TooltipContext.Provider value={ctx}>
            {props.children}
            <Show when={ctx.popoverVisible()}>
                <div ref={setPopper} id="tooltip" class="max-w-xs">
                    <div class="rounded-md bg-neutral-700 z-10 shadow-lg px-4 py-2 font-body text-sm">
                        {ctx.popoverContent}
                    </div>
                    <div data-popper-arrow id="arrow"></div>
                </div>
            </Show>
        </TooltipContext.Provider>
    );
}

export const useTooltip = () => {
    const useCtx = useContext(TooltipContext);
    if (!useCtx) throw new Error("No TooltipContext found");

    return useCtx;
};