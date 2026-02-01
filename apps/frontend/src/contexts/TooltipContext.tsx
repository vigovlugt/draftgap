import { Placement } from "@popperjs/core";
import {
    createContext,
    createEffect,
    createSignal,
    JSX,
    Show,
    useContext,
} from "solid-js";
import usePopper from "solid-popper";
import { Transition } from "solid-transition-group";

export const createTooltipContext = () => {
    const [popoverContent, setPopoverContent] =
        createSignal<JSX.Element | null>("TEST!");
    const [popoverPlacement, setPopoverPlacement] =
        createSignal<Placement>("auto");
    const [popoverTarget, setPopoverTarget] = createSignal<HTMLElement | null>(
        null,
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
            <div class="absolute z-1000 top-0 left-0">
                <Transition
                    enterActiveClass="transition-opacity duration-100 ease-out"
                    enterClass="opacity-0"
                    enterToClass="opacity-100"
                    exitActiveClass="transition-opacity duration-75 ease-out"
                    exitClass="opacity-100"
                    exitToClass="opacity-0"
                >
                    <Show when={ctx.popoverVisible()}>
                        <div
                            ref={setPopper}
                            id="tooltip"
                            class="max-w-xs w-max"
                        >
                            <div class="rounded-md bg-neutral-800 shadow-lg px-4 py-2 font-body text-sm ring-1 ring-white/20">
                                {ctx.popoverContent()}
                            </div>
                            <div data-popper-arrow id="arrow" />
                        </div>
                    </Show>
                </Transition>
            </div>
        </TooltipContext.Provider>
    );
}

export const useTooltip = () => {
    const useCtx = useContext(TooltipContext);
    if (!useCtx) throw new Error("No TooltipContext found");

    return useCtx;
};
