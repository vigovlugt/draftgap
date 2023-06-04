import { onCleanup } from "solid-js";

export default function clickOutside(el: HTMLElement, accessor: any) {
    const onClick = (e: MouseEvent) =>
        !el.contains(e.target as any) && accessor()?.();
    document.body.addEventListener("click", onClick);

    onCleanup(() => document.body.removeEventListener("click", onClick));
}
