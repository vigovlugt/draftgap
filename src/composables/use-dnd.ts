import { useDragDropContext } from "@thisbeyond/solid-dnd";
import { createSignal, onCleanup } from "solid-js";
import { useDraft } from "../context/DraftContext";

export function useDnd() {
    const { pickChampion } = useDraft();

    const [pos, setPos] = createSignal({ x: 0, y: 0 });
    function handleMouseMove(event: MouseEvent) {
        setPos({
            x: event.clientX,
            y: event.clientY,
        });
    }
    window.addEventListener("mousemove", handleMouseMove);
    onCleanup(() => {
        window.removeEventListener("mousemove", handleMouseMove);
    });

    const [, { onDragEnd }] = useDragDropContext()!;
    onDragEnd(({ draggable, droppable }) => {
        if (!droppable) {
            return;
        }

        const { suggestion } = draggable.data;
        const { team, index } = droppable.data;
        if (
            suggestion === undefined ||
            team === undefined ||
            index === undefined
        ) {
            return;
        }

        if (
            pos().x < droppable.layout.x ||
            pos().x > droppable.layout.x + droppable.layout.width ||
            pos().y < droppable.layout.y ||
            pos().y > droppable.layout.y + droppable.layout.height
        ) {
            return;
        }

        console.log(suggestion);

        pickChampion(team, index, suggestion.championKey, suggestion.role);
    });
}
