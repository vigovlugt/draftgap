import { Component, Match, Switch } from "solid-js";
import { ClientState, useLolClient } from "../../contexts/LolClientContext";
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
import { useUser } from "../../contexts/UserContext";
import { t } from "../../utils/i18n";

type Props = {
    setShowDownloadModal: (show: boolean) => void;
};

export const LolClientStatusBadge: Component<Props> = (props) => {
    const { isDesktop } = useMedia();
    const { clientState, clientError } = useLolClient();
    const { config } = useUser();

    return (
        <Switch>
            <Match when={!isDesktop}>
                <Badge
                    as="button"
                    onClick={() => props.setShowDownloadModal(true)}
                    theme="primary"
                    class="hidden md:block hover:opacity-70 transition"
                >
                    {t(config, "syncWithLeagueClient")}
                </Badge>
            </Match>
            <Match when={clientState() === ClientState.Disabled}>
                <Badge theme="secondary">{t(config, "disabled")}</Badge>
            </Match>
            <Match when={clientState() === ClientState.MainMenu}>
                <Badge theme="primary">{t(config, "connected")}</Badge>
            </Match>
            <Match when={clientState() === ClientState.InChampSelect}>
                <Badge theme="primary">{t(config, "champSelect")}</Badge>
            </Match>
            <Match when={clientState() === ClientState.NotFound}>
                <Dialog>
                    <DialogTrigger>
                        <Badge
                            theme="secondary"
                            class="transition hover:bg-neutral-700"
                        >
                            {t(config, "notConnected")}
                            <Icon
                                path={questionMarkCircle}
                                class="w-5 inline text-neutral-400 ml-1 -mr-2"
                            />
                        </Badge>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {t(config, "cantFindLeagueClient")}
                            </DialogTitle>
                        </DialogHeader>
                        <p class="font-body">
                            {t(config, "leagueClientNotFoundHelp")}
                        </p>
                        <p class="font-body">
                            {t(config, "adminError")}
                            <br />
                            <span
                                class="bg-neutral-800 px-2 py-1 rounded-sm"
                                style={{ "font-family": "monospace" }}
                            >
                                {clientError() ?? t(config, "noError")}
                            </span>
                        </p>
                    </DialogContent>
                </Dialog>
            </Match>
        </Switch>
    );
};
