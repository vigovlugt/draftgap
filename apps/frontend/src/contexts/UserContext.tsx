import {
    JSXElement,
    createContext,
    createEffect,
    createSignal,
    useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Role } from "@draftgap/core/src/models/Role";
import { DraftGapConfig } from "@draftgap/core/src/models/user/Config";

type FavouritePick = `${string}:${Role}`;

const DEFAULT_CONFIG: DraftGapConfig = {
    // DRAFT CONFIG
    ignoreChampionWinrates: false,
    riskLevel: "medium",
    minGames: 1000,

    // UI
    showFavouritesAtTop: false,
    banPlacement: "bottom",
    unownedPlacement: "bottom",
    showAdvancedWinrates: false,
    language: "en_US",

    // MISC
    defaultStatsSite: "lolalytics",
    enableBetaFeatures: false,

    // LOL CLIENT
    disableLeagueClientIntegration: false,
};

const FAVOURITE_PICKS_KEY = "draftgap-favourite-picks";
const CONFIG_KEY = "draftgap-config";

function createConfig() {
    const partialInitialConfig = JSON.parse(
        localStorage.getItem(CONFIG_KEY) || "{}"
    );

    const [config, setConfig] = createStore<DraftGapConfig>({
        ...DEFAULT_CONFIG,
        ...partialInitialConfig,
    });
    createEffect(() => {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    });

    return [config, setConfig] as const;
}

function createFavouritePicks() {
    const favouriteInitial = localStorage.getItem(FAVOURITE_PICKS_KEY);
    const favouriteInitialParsed = JSON.parse(favouriteInitial || "[]");

    const [favouritePicks, setFavouritePicks] = createSignal<
        Set<FavouritePick>
    >(new Set(favouriteInitialParsed));
    createEffect(() => {
        localStorage.setItem(
            "draftgap-favourite-picks",
            JSON.stringify([...favouritePicks()])
        );
    });

    return [favouritePicks, setFavouritePicks] as const;
}

function createUserContext() {
    const [config, setConfig] = createConfig();
    const [favouritePicks, setFavouritePicks] = createFavouritePicks();

    function setFavourite(championKey: string, role: Role, value: boolean) {
        const favouritePick: FavouritePick = `${championKey}:${role}`;
        const newFavourites = new Set(favouritePicks());

        if (value) {
            newFavourites.add(favouritePick);
        } else {
            newFavourites.delete(favouritePick);
        }

        setFavouritePicks(newFavourites);
    }

    const isFavourite = (championKey: string, role: Role) => {
        const favouritePick: FavouritePick = `${championKey}:${role}`;

        return favouritePicks().has(favouritePick);
    };

    return {
        config,
        setConfig,
        favouritePicks,
        setFavourite,
        isFavourite,
    };
}

const UserContext =
    createContext<ReturnType<typeof createUserContext>>(undefined);

export function UserProvider(props: { children: JSXElement }) {
    const ctx = createUserContext();

    return (
        <UserContext.Provider value={ctx}>
            {props.children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const useCtx = useContext(UserContext);
    if (!useCtx) throw new Error("No UserContext found");

    return useCtx;
}
