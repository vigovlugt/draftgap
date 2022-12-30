import { Component } from "solid-js";
import { useDraft } from "../context/DraftContext";
import { ClientState, useLolClient } from "../context/LolClientContext";

export const LolClientStatusBadge: Component = () => {
    const { isDesktop } = useDraft();
    if (!isDesktop) return <></>;

    const { clientState } = useLolClient();

    const stateClass = () =>
        clientState() == ClientState.NotFound
            ? "bg-neutral-800 text-neutral-100"
            : "bg-neutral-100 text-neutral-800";

    const stateName = () =>
        ((
            {
                [ClientState.NotFound]: "Not Connected",
                [ClientState.MainMenu]: "Connected",
                [ClientState.InChampSelect]: "Champ Select",
            } as Record<ClientState, string>
        )[clientState()]);

    return (
        <span
            class={`uppercase inline-flex items-center rounded-full px-3 py-0.5 text-xl font-medium ${stateClass()}`}
        >
            {stateName()}
        </span>
    );
};
