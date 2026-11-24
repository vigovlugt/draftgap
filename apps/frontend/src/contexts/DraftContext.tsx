import {
    batch,
    createContext,
    createMemo,
    createSignal,
    JSXElement,
    useContext,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { displayNameByRole, Role } from "@draftgap/core/src/models/Role";
import { Team } from "@draftgap/core/src/models/Team";
import { useDraftView } from "./DraftViewContext";
import { useDataset } from "./DatasetContext";
import { useDraftFilters } from "./DraftFiltersContext";

export type TeamPick = {
    championKey: string | undefined;
    role: Role | undefined;
    hover: boolean;
};

export const getPickedChampionKey = (pick: TeamPick) =>
    pick.hover ? undefined : pick.championKey;

export const getVisibleChampionKey = (
    pick: TeamPick,
    analyzeHovers: boolean,
) => (pick.hover && !analyzeHovers ? undefined : pick.championKey);

const emptyPick = (): TeamPick => ({
    championKey: undefined,
    role: undefined,
    hover: false,
});

type TeamPicks = [TeamPick, TeamPick, TeamPick, TeamPick, TeamPick];

export type SelectionType = "pick" | "ban";

type Selection = {
    type: SelectionType;
    team: Team | undefined;
    index: number;
};

const toTeamBans = (championKeys: (string | undefined)[] = []) =>
    Array.from({ length: 5 }, (_, i) => championKeys[i]);

export function createDraftContext() {
    const { dataset } = useDataset();
    const { setCurrentDraftView, currentDraftView } = useDraftView();
    const { resetDraftFilters } = useDraftFilters();

    const [allyTeam, setAllyTeam] = createStore<TeamPicks>([
        emptyPick(),
        emptyPick(),
        emptyPick(),
        emptyPick(),
        emptyPick(),
    ]);
    const [opponentTeam, setOpponentTeam] = createStore<TeamPicks>([
        emptyPick(),
        emptyPick(),
        emptyPick(),
        emptyPick(),
        emptyPick(),
    ]);

    const [bans, setBans] = createStore<Record<Team, (string | undefined)[]>>({
        ally: toTeamBans(),
        opponent: toTeamBans(),
    });
    const allBans = createMemo(
        () =>
            new Set(
                [...bans.ally, ...bans.opponent].filter(
                    (b): b is string => b !== undefined,
                ),
            ),
    );
    // If empty, assume all champions are owned
    const [ownedChampions, setOwnedChampions] = createSignal<Set<string>>(
        new Set(),
    );

    function getNextPick(team: Team) {
        const picks = team === "ally" ? allyTeam : opponentTeam;

        return picks.findIndex(
            (pick) => getPickedChampionKey(pick) === undefined,
        );
    }

    function getNextBan(team: Team) {
        return bans[team].findIndex((ban) => ban === undefined);
    }

    function removeBan(championKey: string) {
        for (const team of ["ally", "opponent"] as const) {
            const index = bans[team].indexOf(championKey);
            if (index !== -1) {
                setBans(team, index, undefined);
            }
        }
    }

    function fixClashes(championKey: string, index: number) {
        const allyClashingChampion = allyTeam.findIndex(
            (p) => p.championKey === championKey,
        );
        if (allyClashingChampion !== -1 && allyClashingChampion !== index) {
            resetChampion("ally", allyClashingChampion);
        }
        const opponentClashingChampion = opponentTeam.findIndex(
            (p) => p.championKey === championKey,
        );
        if (opponentClashingChampion !== -1 && allyClashingChampion !== index) {
            resetChampion("opponent", opponentClashingChampion);
        }
    }

    function fixRoleClashes(team: Team, role: Role, index: number) {
        const teamPicks = team === "ally" ? allyTeam : opponentTeam;
        const setTeam = team === "ally" ? setAllyTeam : setOpponentTeam;

        const clashingRole = teamPicks.findIndex((p) => p.role === role);
        if (clashingRole !== -1 && clashingRole !== index) {
            setTeam(clashingRole, "role", undefined);
        }
    }

    function pickChampion(
        team: "ally" | "opponent",
        index: number,
        championKey: string | undefined,
        role: Role | undefined,
        {
            updateSelection = true,
            resetFilters = true,
            reportEvent = true,
            updateView = true,
        } = {},
    ) {
        batch(() => {
            if (
                championKey &&
                dataset()?.championData[championKey] === undefined
            ) {
                return;
            }

            const setTeam = team === "ally" ? setAllyTeam : setOpponentTeam;

            if (championKey !== undefined) {
                fixClashes(championKey, index);
                removeBan(championKey);
            }
            if (championKey !== undefined && role !== undefined) {
                fixRoleClashes(team, role, index);
            }

            setTeam(index, {
                championKey,
                role,
                hover: false,
            });

            if (updateSelection) {
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

            if (
                draftFinished() &&
                updateView &&
                currentDraftView().type === "draft"
            ) {
                setCurrentDraftView({
                    type: "analysis",
                });
            }

            if (resetFilters) {
                resetDraftFilters();
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
    }

    function hoverChampion(
        team: "ally" | "opponent",
        index: number,
        championKey: string | undefined,
        role: Role | undefined,
    ) {
        batch(() => {
            if (
                championKey &&
                dataset()?.championData[championKey] === undefined
            ) {
                return;
            }

            const setTeam = team === "ally" ? setAllyTeam : setOpponentTeam;

            if (championKey !== undefined) {
                fixClashes(championKey, index);
            }

            if (championKey !== undefined && role !== undefined) {
                fixRoleClashes(team, role, index);
            }

            setTeam(index, {
                championKey,
                role,
                hover: championKey !== undefined,
            });
        });
    }

    const resetChampion = (team: "ally" | "opponent", index: number) => {
        pickChampion(team, index, undefined, undefined, {
            updateSelection: false,
            resetFilters: false,
        });
    };

    function selectNextPick(
        team: Team = "ally",
        { resetFilters = true }: { resetFilters?: boolean } = {},
    ) {
        const otherTeam: Team = team === "ally" ? "opponent" : "ally";
        for (const t of [team, otherTeam]) {
            if (getNextPick(t) !== -1)
                return select(t, undefined, { resetFilters });
        }
        select(undefined, 0, { resetFilters });
    }

    function selectNextEmptySlot(team: Team) {
        const otherTeam: Team = team === "ally" ? "opponent" : "ally";
        for (const t of [team, otherTeam]) {
            if (getNextBan(t) !== -1)
                return select(t, undefined, { type: "ban" });
        }
        selectNextPick();
    }

    function banChampion(team: Team, index: number, championKey: string) {
        batch(() => {
            removeBan(championKey);
            setBans(team, index, championKey);
            selectNextEmptySlot(team);

            gtag("event", "ban_champion", {
                event_category: "draft",
                champion_key: championKey,
                champion_name: dataset()!.championData[championKey].name,
            });
        });
    }

    /** Bans a champion in the team's next empty ban slot, without changing the selection. */
    function addBan(team: Team, championKey: string) {
        batch(() => {
            removeBan(championKey);
            const index = getNextBan(team);
            if (index === -1) return;
            setBans(team, index, championKey);
        });
    }

    const resetBan = (team: Team, index: number) =>
        setBans(team, index, undefined);

    const setTeamBans = (team: Team, championKeys: (string | undefined)[]) =>
        setBans(team, reconcile(toTeamBans(championKeys)));

    const resetTeam = (team: "ally" | "opponent") => {
        batch(() => {
            for (let i = 0; i < 5; i++) {
                resetChampion(team, i);
            }
            setBans(team, toTeamBans());

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
        type: "pick",
        team: "ally",
        index: 0,
    });

    const select = (
        team: Team | undefined,
        index?: number,
        {
            type = "pick",
            resetFilters = true,
        }: { type?: SelectionType; resetFilters?: boolean } = {},
    ) => {
        // Filled pick slots can be selected to replace their champion.
        if (
            type === "ban" &&
            team !== undefined &&
            index !== undefined &&
            bans[team][index] !== undefined
        ) {
            return;
        }

        if (index === undefined && team !== undefined) {
            index = type === "ban" ? getNextBan(team) : getNextPick(team);
        }

        setSelection({ type, team, index: index ?? 0 });
        if (resetFilters) {
            resetDraftFilters();
        }

        setCurrentDraftView({
            type: "draft",
        });
    };

    /** Champion in the selected pick slot, which a new pick would replace. */
    const selectedChampionKey = () => {
        if (selection.type !== "pick" || !selection.team) return undefined;
        const picks = selection.team === "ally" ? allyTeam : opponentTeam;
        return picks[selection.index]?.championKey;
    };

    const draftFinished = () =>
        [...allyTeam, ...opponentTeam].every(
            (s) => getPickedChampionKey(s) !== undefined,
        );

    return {
        allyTeam,
        opponentTeam,
        bans,
        allBans,
        banChampion,
        addBan,
        getNextPick,
        getNextBan,
        resetBan,
        setTeamBans,
        ownedChampions,
        setOwnedChampions,
        pickChampion,
        hoverChampion,
        resetChampion,
        resetTeam,
        resetAll,
        selection,
        selectedChampionKey,
        select,
        selectNextPick,
        draftFinished,
    };
}

const DraftContext = createContext<ReturnType<typeof createDraftContext>>();

export function DraftProvider(props: { children: JSXElement }) {
    const ctx = createDraftContext();

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
