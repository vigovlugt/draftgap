import {
    batch,
    createContext,
    createSignal,
    JSXElement,
    useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { displayNameByRole, Role } from "../lib/models/Role";
import { Team } from "../lib/models/Team";
import { AnalyzeDraftConfig } from "../lib/draft/analysis";
import { createStoredSignal } from "../utils/signals";
import { useDraftView } from "./DraftViewContext";
import { useMedia } from "../hooks/useMedia";
import { useDataset } from "./DatasetContext";

type TeamPick = {
    championKey: string | undefined;
    role: Role | undefined;
};

type TeamPicks = [TeamPick, TeamPick, TeamPick, TeamPick, TeamPick];

type Selection = {
    team: Team | undefined;
    index: number;
};

type FavouritePick = `${string}:${Role}`;

export type StatsSite = "op.gg" | "u.gg" | "lolalytics";

export const DraftTablePlacement = {
    Bottom: "bottom",
    Hidden: "hidden",
    InPlace: "in-place",
} as const;
type DraftTablePlacement =
    (typeof DraftTablePlacement)[keyof typeof DraftTablePlacement];

export type DraftGapConfig = AnalyzeDraftConfig & {
    disableLeagueClientIntegration: boolean;
    showFavouritesAtTop: boolean;
    banPlacement: DraftTablePlacement;
    unownedPlacement: DraftTablePlacement;
    defaultStatsSite: StatsSite;
};

export function createDraftContext() {
    const { dataset } = useDataset();
    const { setCurrentDraftView } = useDraftView();
    const { isMobileLayout } = useMedia();

    const [allyTeam, setAllyTeam] = createStore<TeamPicks>([
        { championKey: undefined, role: undefined },
        { championKey: undefined, role: undefined },
        { championKey: undefined, role: undefined },
        { championKey: undefined, role: undefined },
        { championKey: undefined, role: undefined },
    ]);
    const [opponentTeam, setOpponentTeam] = createStore<TeamPicks>([
        { championKey: undefined, role: undefined },
        { championKey: undefined, role: undefined },
        { championKey: undefined, role: undefined },
        { championKey: undefined, role: undefined },
        { championKey: undefined, role: undefined },
    ]);

    const [bans, setBans] = createStore<string[]>([]);
    // If empty, assume all champions are owned
    const [ownedChampions, setOwnedChampions] = createSignal<Set<string>>(
        new Set()
    );

    const [search, setSearch] = createSignal("");
    const [roleFilter, setRoleFilter] = createSignal<Role>();

    const [favouriteFilter, setFavouriteFilter] = createSignal(false);

    function getNextPick(team: Team) {
        const picks = team === "ally" ? allyTeam : opponentTeam;

        return picks.findIndex((pick) => pick.championKey === undefined);
    }

    const pickChampion = (
        team: "ally" | "opponent",
        index: number,
        championKey: string | undefined,
        role: Role | undefined,
        { updateSelection = true, resetFilters = true, reportEvent = true } = {}
    ) => {
        batch(() => {
            const teamPicks = team === "ally" ? allyTeam : opponentTeam;
            const setTeam = team === "ally" ? setAllyTeam : setOpponentTeam;

            if (championKey !== undefined) {
                const allyClashingChampion = allyTeam.findIndex(
                    (p) => p.championKey === championKey
                );
                if (
                    allyClashingChampion !== -1 &&
                    allyClashingChampion !== index
                ) {
                    resetChampion("ally", allyClashingChampion);
                }
                const opponentClashingChampion = opponentTeam.findIndex(
                    (p) => p.championKey === championKey
                );
                if (
                    opponentClashingChampion !== -1 &&
                    allyClashingChampion !== index
                ) {
                    resetChampion("opponent", opponentClashingChampion);
                }
            }
            setTeam(index, "championKey", championKey);

            if (championKey !== undefined) {
                const clashingRole = teamPicks.findIndex(
                    (p) => p.role === role
                );
                if (clashingRole !== -1 && clashingRole !== index) {
                    setTeam(clashingRole, "role", undefined);
                }
            }
            setTeam(index, "role", role);
            setCurrentDraftView({
                type: "draft",
                subType: team,
            });

            if (updateSelection && !isMobileLayout()) {
                let nextIndex = getNextPick(team);
                if (nextIndex === -1) {
                    const otherTeam = team === "ally" ? "opponent" : "ally";
                    nextIndex = getNextPick(otherTeam);
                    if (nextIndex !== -1) {
                        select(otherTeam, nextIndex);
                    } else {
                        select(undefined, 0);
                    }
                } else {
                    select(team, nextIndex);
                }
            }

            if (draftFinished()) {
                setCurrentDraftView({
                    type: "analysis",
                });
            }

            if (resetFilters) {
                setSearch("");
                setRoleFilter(undefined);
                setFavouriteFilter(false);
            }

            if (reportEvent && championKey !== undefined) {
                gtag("event", "pick_champion", {
                    event_category: "draft",
                    champion_key: championKey,
                    champion_name: dataset()!.championData[championKey].name,
                    role,
                    role_name: role ? displayNameByRole[role] : undefined,
                });
            }
        });
    };

    const resetChampion = (team: "ally" | "opponent", index: number) => {
        pickChampion(team, index, undefined, undefined, {
            updateSelection: false,
            resetFilters: false,
        });
    };

    const resetTeam = (team: "ally" | "opponent") => {
        batch(() => {
            for (let i = 0; i < 5; i++) {
                resetChampion(team, i);
            }

            select(team, 0);
        });
    };

    const resetAll = () => {
        batch(() => {
            resetTeam("ally");
            resetTeam("opponent");
        });
    };

    const [selection, setSelection] = createStore<Selection>({
        team: isMobileLayout() ? undefined : "ally",
        index: 0,
    });

    const select = (
        team: Team | undefined,
        index?: number,
        resetFilters = true
    ) => {
        if (team !== undefined && index !== undefined) {
            const teamPicks = team === "ally" ? allyTeam : opponentTeam;
            if (teamPicks[index].championKey !== undefined) {
                return;
            }
        }

        if (index === undefined && team !== undefined) {
            index = getNextPick(team!);
        }

        setSelection("team", team);
        setSelection("index", index ?? 0);
        if (resetFilters) {
            setSearch("");
            setRoleFilter(undefined);
            setFavouriteFilter(false);
        }

        setCurrentDraftView({
            type: "draft",
            subType: (draftFinished() ? "draft" : team) ?? "draft",
        });
    };

    const draftFinished = () =>
        [...allyTeam, ...opponentTeam].every(
            (s) => s.championKey !== undefined
        );

    const [favouritePicks, setFavouritePicks] = createStoredSignal<
        Set<FavouritePick>
    >(
        "draftgap-favourite-picks",
        new Set(),
        {
            equals: false,
        },
        undefined,
        (value) => JSON.stringify([...value]),
        (value) => new Set(JSON.parse(value))
    );

    const toggleFavourite = (championKey: string, role: Role) => {
        const favouritePick: FavouritePick = `${championKey}:${role}`;

        if (favouritePicks().has(favouritePick)) {
            favouritePicks().delete(favouritePick);
        } else {
            favouritePicks().add(favouritePick);
        }

        setFavouritePicks(favouritePicks());
    };

    const isFavourite = (championKey: string, role: Role) => {
        const favouritePick: FavouritePick = `${championKey}:${role}`;

        return favouritePicks().has(favouritePick);
    };

    // TODO: Split up in filters and user favourites and owned champions
    return {
        allyTeam,
        opponentTeam,
        bans,
        setBans,
        ownedChampions,
        setOwnedChampions,
        pickChampion,
        resetChampion,
        resetTeam,
        resetAll,
        selection,
        select,
        search,
        roleFilter,
        favouriteFilter,
        setFavouriteFilter,
        setSearch,
        setRoleFilter,
        draftFinished,
        isFavourite,
        toggleFavourite,
    };
}

const DraftContext = createContext<ReturnType<typeof createDraftContext>>();

export function DraftProvider(props: { children: JSXElement }) {
    const ctx = createDraftContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DRAFTGAP_DEBUG = ((window as any).DRAFTGAP_DEBUG = ctx) as any;
    DRAFTGAP_DEBUG.test = () => {
        batch(() => {
            DRAFTGAP_DEBUG.pickChampion("ally", 0, "57", 0);
            DRAFTGAP_DEBUG.pickChampion("ally", 1, "234", 1);
            DRAFTGAP_DEBUG.pickChampion("ally", 2, "30", 2);
            DRAFTGAP_DEBUG.pickChampion("ally", 3, "429", 3);
            DRAFTGAP_DEBUG.pickChampion("ally", 4, "412", 4);

            DRAFTGAP_DEBUG.pickChampion("opponent", 0, "164", 0);
            DRAFTGAP_DEBUG.pickChampion("opponent", 1, "64", 1);
            DRAFTGAP_DEBUG.pickChampion("opponent", 2, "147", 2);
            DRAFTGAP_DEBUG.pickChampion("opponent", 3, "145", 3);
            DRAFTGAP_DEBUG.pickChampion("opponent", 4, "16", 4);
        });
    };

    return (
        <DraftContext.Provider value={ctx}>
            {props.children}
        </DraftContext.Provider>
    );
}

export const useDraft = () => {
    const useCtx = useContext(DraftContext);
    if (!useCtx) throw new Error("No DraftContext found");

    return useCtx;
};
