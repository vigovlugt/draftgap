import { Component } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { ClientState, useLolClient } from "../../context/LolClientContext";
import { createErrorToast } from "../../utils/toast";
import { Badge } from "../common/Badge";

type Props = {
    setShowDownloadModal: (show: boolean) => void;
};

export const LolClientStatusBadge: Component<Props> = ({
    setShowDownloadModal,
}) => {
    const { isDesktop } = useDraft();
    if (!isDesktop)
        return (
            <Badge
                as="button"
                onClick={() => setShowDownloadModal(true)}
                theme="primary"
                class="hidden md:block"
            >
                Sync with league client
            </Badge>
        );

    const { clientState, clientError } = useLolClient();

    const stateName = () =>
        ((
            {
                [ClientState.NotFound]: "Not Connected",
                [ClientState.MainMenu]: "Connected",
                [ClientState.InChampSelect]: "Champ Select",
                [ClientState.Disabled]: "Disabled",
            } as Record<ClientState, string>
        )[clientState()]);

    return (
        <Badge
            theme={
                clientState() == ClientState.NotFound ||
                clientState() === ClientState.Disabled
                    ? "secondary"
                    : "primary"
            }
            onDblClick={() => createErrorToast(clientError() ?? "No error")}
        >
            {stateName()}
        </Badge>
    );
};
