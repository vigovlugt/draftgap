import { Placement } from "@popperjs/core";
import { Transition } from "solid-headless";
import {
    createContext,
    createEffect,
    createSignal,
    JSX,
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
            <Transition
                class="absolute top-1 left-1 z-10 transition opacity-0 translate-y-1"
                show={ctx.popoverVisible()}
                enter="transition duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <div ref={setPopper} id="tooltip" class="max-w-xs w-max">
                    <div class="rounded-md bg-neutral-800 shadow-lg px-4 py-2 font-body text-sm ring-1 ring-white ring-opacity-20">
                        {ctx.popoverContent}
                    </div>
                    <div data-popper-arrow id="arrow" />
                </div>
            </Transition>
        </TooltipContext.Provider>
    );
}

export const useTooltip = () => {
    const useCtx = useContext(TooltipContext);
    if (!useCtx) throw new Error("No TooltipContext found");

    return useCtx;
};
