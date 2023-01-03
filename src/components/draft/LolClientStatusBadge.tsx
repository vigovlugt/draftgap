import { Component } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { ClientState, useLolClient } from "../../context/LolClientContext";

type Props = {
    setShowDownloadModal: (show: boolean) => void;
};

export const LolClientStatusBadge: Component<Props> = ({
    setShowDownloadModal,
}) => {
    const { isDesktop } = useDraft();
    if (!isDesktop)
        return (
            <button
                onClick={() => setShowDownloadModal(true)}
                class={`uppercase inline-flex items-center rounded-full px-3 py-0.5 text-xl font-medium bg-neutral-100 text-neutral-800`}
            >
                Get the desktop app
            </button>
        );

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
