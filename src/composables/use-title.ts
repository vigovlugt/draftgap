import { onCleanup } from "solid-js";

export function useTitle() {
    const titleEl = document.querySelector("title")!;
    const onLoad = () => {
        titleEl.textContent = "𝘿𝙍𝘼𝙁𝙏𝙂𝘼𝙋";
    };
    window.addEventListener("load", onLoad);
}
