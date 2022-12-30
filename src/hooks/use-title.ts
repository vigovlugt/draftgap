import { onCleanup } from "solid-js";

export function useTitle() {
    const titleEl = document.querySelector("title")!;
    const onLoad = () => {
        titleEl.textContent = "𝗗𝗥𝗔𝗙𝗧𝗚𝗔𝗣";
    };
    window.addEventListener("load", onLoad);
}
