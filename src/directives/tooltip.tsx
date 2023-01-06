import { Placement } from "@popperjs/core";
import { Accessor, JSX, onCleanup, onMount } from "solid-js";
import { useTooltip } from "../context/TooltipContext";

type HelpPopoverParams = {
    content: JSX.Element;
    placement?: Placement;
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

    const onHover = (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        const { content, placement } = accessor();

        setPopoverContent(content);
        setPopoverPlacement(placement ?? "auto");
        setPopoverTarget(target);
        setPopoverVisible(true);
    };

    const onHoverLeave = (e: MouseEvent) => {
        setPopoverVisible(false);
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
