import { Component, Show, createSignal } from "solid-js";
import { useDraft } from "../../../context/DraftContext";

type Props = {
    team: string;
    index: number;
};

export const BuildView: Component<Props> = (props) => {
    const {
        allyTeam,
        opponentTeam,
        dataset,
        allyTeamComps,
        opponentTeamComps,
    } = useDraft();
    const team = () => (props.team === "ally" ? allyTeam : opponentTeam);
    const opponentTeamComp = () =>
        props.team === "ally"
            ? opponentTeamComps()[0][0]
            : allyTeamComps()[0][0];

    const [isLoading, setIsLoading] = createSignal(true);

    return (
        <>
            <Show when={isLoading}>
                <div class="text-neutral-50 text-2xl text-center grid place-items-center h-full">
                    Loading...
                </div>
            </Show>
        </>
    );
};
