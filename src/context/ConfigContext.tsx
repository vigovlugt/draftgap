import { JSXElement, createContext, createEffect, useContext } from "solid-js";
import { DraftGapConfig } from "./DraftContext";
import { createStore } from "solid-js/store";

const DEFAULT_CONFIG: DraftGapConfig = {
    // DRAFT CONFIG
    ignoreChampionWinrates: false,
    riskLevel: "medium",
    minGames: 1000,

    // UI
    showFavouritesAtTop: false,
    banPlacement: "bottom",
    unownedPlacement: "bottom",

    // MISC
    defaultStatsSite: "lolalytics",

    // LOL CLIENT
    disableLeagueClientIntegration: false,
};

function createConfigContext() {
    const local = localStorage.getItem("draftgap-config");
    const partialInitialConfig = local ? JSON.parse(local) : {};

    const initialValue = {
        ...DEFAULT_CONFIG,
        ...partialInitialConfig,
    };

    const [config, setConfig] = createStore<DraftGapConfig>(initialValue);

    createEffect(() => {
        console.log("Saving config");
        localStorage.setItem("draftgap-config", JSON.stringify(config));
    });

    return {
        config,
        setConfig,
    };
}

const ConfigContext =
    createContext<ReturnType<typeof createConfigContext>>(undefined);

export function ConfigProvider(props: { children: JSXElement }) {
    const ctx = createConfigContext();

    return (
        <ConfigContext.Provider value={ctx}>
            {props.children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const useCtx = useContext(ConfigContext);
    if (!useCtx) throw new Error("No ConfigContext found");

    return useCtx;
}
