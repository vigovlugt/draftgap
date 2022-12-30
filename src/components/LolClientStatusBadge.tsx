import { Component } from "solid-js";
import { useDraft } from "../context/DraftContext";
import { ClientState, useLolClient } from "../context/LolClientContext";

export const LolClientStatusBadge: Component = () => {
    const { isDesktop } = useDraft();
    if (!isDesktop) return <></>;

    const { clientState } = useLolClient();

    const stateClass = () =>
        ((
            {
                [ClientState.NotFound]: "bg-red-100 text-red-800",
                [ClientState.MainMenu]: "bg-neutral-100 text-neutral-800",
                [ClientState.InChampSelect]: "bg-blue-100 text-blue-800",
            } as Record<ClientState, string>
        )[clientState()]);

    const stateName = () =>
        ((
            {
                [ClientState.NotFound]: "Not connected",
                [ClientState.MainMenu]: "Connected",
                [ClientState.InChampSelect]: "Champ select",
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
