import { createMediaQuery } from "./createMediaQuery";

export function useMedia() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isDesktop = (window as any).__TAURI__ !== undefined;
    const isMobileLayout = createMediaQuery("(max-width: 1023px)");

    return {
        isDesktop,
        isMobileLayout,
    };
}
