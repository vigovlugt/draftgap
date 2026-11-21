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

type TeamPick = {
    championKey: string | undefined;
    role: Role | undefined;
    hoverKey: string | undefined;
};

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
        { championKey: undefined, role: undefined, hoverKey: undefined },
        { championKey: undefined, role: undefined, hoverKey: undefined },
        { championKey: undefined, role: undefined, hoverKey: undefined },
        { championKey: undefined, role: undefined, hoverKey: undefined },
        { championKey: undefined, role: undefined, hoverKey: undefined },
    ]);
    const [opponentTeam, setOpponentTeam] = createStore<TeamPicks>([
        { championKey: undefined, role: undefined, hoverKey: undefined },
        { championKey: undefined, role: undefined, hoverKey: undefined },
        { championKey: undefined, role: undefined, hoverKey: undefined },
        { championKey: undefined, role: undefined, hoverKey: undefined },
        { championKey: undefined, role: undefined, hoverKey: undefined },
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

        return picks.findIndex((pick) => pick.championKey === undefined);
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
                hoverKey: undefined,
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
                championKey: undefined,
                role,
                hoverKey: championKey,
            });
        });
    }

    const resetChampion = (team: "ally" | "opponent", index: number) => {
        pickChampion(team, index, undefined, undefined, {
            updateSelection: false,
            resetFilters: false,
        });
    };

    function selectNextEmptySlot(team: Team) {
        const otherTeam: Team = team === "ally" ? "opponent" : "ally";
        for (const t of [team, otherTeam]) {
            if (getNextBan(t) !== -1)
                return select(t, undefined, { type: "ban" });
        }
        for (const t of ["ally", "opponent"] as const) {
            if (getNextPick(t) !== -1) return select(t);
        }
        select(undefined, 0);
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
        if (team !== undefined && index !== undefined) {
            const isFilled =
                type === "ban"
                    ? bans[team][index] !== undefined
                    : (team === "ally" ? allyTeam : opponentTeam)[index]
                          .championKey !== undefined;
            if (isFilled) {
                return;
            }
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

    const draftFinished = () =>
        [...allyTeam, ...opponentTeam].every(
            (s) => s.championKey !== undefined,
        );

    return {
        allyTeam,
        opponentTeam,
        bans,
        allBans,
        banChampion,
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
        select,
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
