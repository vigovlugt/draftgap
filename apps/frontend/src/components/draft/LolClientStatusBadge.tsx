import { Component, Match, Switch } from "solid-js";
import { ClientState, useLolClient } from "../../contexts/LolClientContext";
import { createErrorToast } from "../../utils/toast";
import { Badge } from "../common/Badge";
import { useMedia } from "../../hooks/useMedia";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../common/Dialog";
import { Icon } from "solid-heroicons";
import { questionMarkCircle } from "solid-heroicons/solid-mini";

type Props = {
    setShowDownloadModal: (show: boolean) => void;
};

export const LolClientStatusBadge: Component<Props> = (props) => {
    const { isDesktop } = useMedia();
    const { clientState, clientError } = useLolClient();

    return (
        <Switch>
            <Match when={!isDesktop}>
                <Badge
                    as="button"
                    onClick={() => props.setShowDownloadModal(true)}
                    theme="primary"
                    class="hidden md:block"
                >
                    Sync with league client
                </Badge>
            </Match>
            <Match when={clientState() === ClientState.Disabled}>
                <Badge theme="secondary">Disabled</Badge>
            </Match>
            <Match when={clientState() === ClientState.MainMenu}>
                <Badge theme="primary">Connected</Badge>
            </Match>
            <Match when={clientState() === ClientState.InChampSelect}>
                <Badge theme="primary">Champ Select</Badge>
            </Match>
            <Match when={clientState() === ClientState.NotFound}>
                <Dialog>
                    <DialogTrigger>
                        <Badge
                            theme="secondary"
                            class="transition hover:bg-neutral-700"
                        >
                            Not Connected
                            <Icon
                                path={questionMarkCircle}
                                class="w-5 inline text-neutral-400 ml-1 -mr-2"
                            />
                        </Badge>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Can't find League Client</DialogTitle>
                        </DialogHeader>
                        <p class="font-body">
                            Could not find the League of Legends client. Make
                            sure it's running and you're logged in. If that
                            doesn't work, try starting DraftGap as
                            administrator.
                        </p>
                        <p class="font-body">
                            Admin error:
                            <br />
                            <span
                                class="bg-neutral-800 px-2 py-1 rounded"
                                style={{ "font-family": "monospace" }}
                            >
                                {clientError() ?? "No error"}
                            </span>
                        </p>
                    </DialogContent>
                </Dialog>
            </Match>
        </Switch>
    );
};
