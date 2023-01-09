import { createSignal, onCleanup } from "solid-js";

export const createMediaQuery = (query: string) => {
    const matchQuery = window.matchMedia(query);

    const [matches, setMatches] = createSignal(matchQuery.matches);

    const handler = (match: MediaQueryListEvent) => {
        setMatches(match.matches);
    };

    matchQuery.addEventListener("change", handler);
    onCleanup(() => {
        matchQuery.removeEventListener("change", handler);
    });

    return matches;
};
