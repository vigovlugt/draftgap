import { For } from "solid-js";
import { Pick } from "./Pick";

interface IProps {
    team: "ally" | "opponent";
}

export function TeamSidebar({ team }: IProps) {
    return (
        <div class="bg-primary p-2 flex flex-col h-full">
            <div class="flex-1 flex justify-center items-center text-5xl">
                {team.toUpperCase()}
            </div>
            <For each={[0, 1, 2, 3, 4]}>
                {(idx) => <Pick team={team} idx={idx} />}
            </For>
        </div>
    );
}
