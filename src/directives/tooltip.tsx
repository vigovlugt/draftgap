import { Placement } from "@popperjs/core";
import { Accessor, JSX, onCleanup, onMount } from "solid-js";
import { useTooltip } from "../context/TooltipContext";

type HelpPopoverParams = {
    content: JSX.Element;
    placement?: Placement;
    delay?: number;
};

export function tooltip(
    el: HTMLElement,
    accessor: Accessor<HelpPopoverParams>
) {
    const {
        setPopoverContent,
        setPopoverPlacement,
        setPopoverTarget,
        setPopoverVisible,
    } = useTooltip();

    let timeout: NodeJS.Timeout | undefined;

    const onHover = (e: MouseEvent) => {
        const { content, placement, delay } = accessor();
        const target = e.target as HTMLElement;

        timeout = setTimeout(() => {
            setPopoverContent(content);
            setPopoverPlacement(placement ?? "auto");
            setPopoverTarget(target);
            setPopoverVisible(true);
        }, delay ?? 300);
    };

    const onHoverLeave = (e: MouseEvent) => {
        setPopoverVisible(false);
        clearTimeout(timeout);
    };

    onMount(() => {
        el.addEventListener("mouseleave", onHoverLeave);
        el.addEventListener("mouseenter", onHover);
    });

    onCleanup(() => {
        el.removeEventListener("mouseleave", onHoverLeave);
        el.removeEventListener("mouseenter", onHover);
    });
}
