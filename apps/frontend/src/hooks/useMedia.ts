import { createMediaQuery } from "./createMediaQuery";
import { isTauri } from "@tauri-apps/api/core";

export function useMedia() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isDesktop = isTauri();
    const isMobileLayout = createMediaQuery("(max-width: 1023px)");

    return {
        isDesktop,
        isMobileLayout,
    };
}
