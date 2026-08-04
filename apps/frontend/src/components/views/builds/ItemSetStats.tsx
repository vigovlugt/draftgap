import { Component } from "solid-js";
import { Panel, PanelHeader } from "../../common/Panel";
import { useUser } from "../../../contexts/UserContext";
import { t } from "../../../utils/i18n";

export const ItemSetStats: Component = () => {
    const { config } = useUser();

    return (
        <Panel>
            <PanelHeader>{t(config, "builds")}</PanelHeader>
        </Panel>
    );
};
