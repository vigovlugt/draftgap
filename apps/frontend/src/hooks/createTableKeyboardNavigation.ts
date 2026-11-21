import { onCleanup, onMount } from "solid-js";
import { Team } from "@draftgap/core/src/models/Team";

export function createTableKeyboardNavigation(
    tableId: string,
    selectTeam: (team: Team) => void,
) {
    onMount(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const table = document.getElementById(tableId);
            if (!table) return;

            const activeElement = document.activeElement;
            if (
                activeElement?.tagName === "INPUT" &&
                e.key !== "ArrowUp" &&
                e.key !== "ArrowDown"
            ) {
                return;
            }

            const selectFirstRow = () => {
                (
                    table.querySelector("tbody tr") as HTMLTableRowElement
                )?.focus();
            };

            if (e.key === "ArrowLeft" || e.key === "h") {
                e.preventDefault();
                selectTeam("ally");
            } else if (e.key === "ArrowRight" || e.key === "l") {
                e.preventDefault();
                selectTeam("opponent");
            } else if (e.key === "ArrowUp" || e.key === "k") {
                e.preventDefault();
                if (!activeElement || activeElement.tagName !== "TR") {
                    selectFirstRow();
                    return;
                }
                const previous =
                    activeElement.previousSibling as HTMLTableRowElement;
                if (previous.tagName === "TR") {
                    previous.focus();
                }
            } else if (e.key === "ArrowDown" || e.key === "j") {
                e.preventDefault();
                if (!activeElement || activeElement.tagName !== "TR") {
                    selectFirstRow();
                    return;
                }
                const next = activeElement.nextSibling as HTMLTableRowElement;
                if (next.tagName === "TR") {
                    next.focus();
                }
            }
        };
        window.addEventListener("keydown", onKeyDown);
        onCleanup(() => {
            window.removeEventListener("keydown", onKeyDown);
        });
    });
}
