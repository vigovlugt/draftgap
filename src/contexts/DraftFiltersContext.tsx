import {
    JSXElement,
    batch,
    createContext,
    createSignal,
    useContext,
} from "solid-js";
import { Role } from "../lib/models/Role";

export function createDraftFiltersContext() {
    const [search, setSearch] = createSignal("");
    const [roleFilter, setRoleFilter] = createSignal<Role>();

    const [favouriteFilter, setFavouriteFilter] = createSignal(false);

    function resetDraftFilters() {
        batch(() => {
            setSearch("");
            setRoleFilter(undefined);
            setFavouriteFilter(false);
        });
    }

    return {
        search,
        setSearch,
        roleFilter,
        setRoleFilter,
        favouriteFilter,
        setFavouriteFilter,
        resetDraftFilters,
    };
}

export const DraftFiltersContext =
    createContext<ReturnType<typeof createDraftFiltersContext>>(undefined);

export function DraftFiltersProvider(props: { children: JSXElement }) {
    const ctx = createDraftFiltersContext();

    return (
        <DraftFiltersContext.Provider value={ctx}>
            {props.children}
        </DraftFiltersContext.Provider>
    );
}

export function useDraftFilters() {
    const useCtx = useContext(DraftFiltersContext);
    if (!useCtx) throw new Error("No DraftFiltersContext found");

    return useCtx;
}
