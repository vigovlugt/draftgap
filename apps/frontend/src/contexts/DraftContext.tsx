import {
    batch,
    createContext,
    createSignal,
    JSXElement,
    useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { displayNameByRole, Role } from "draftgap-core/src/models/Role";
import { Team } from "draftgap-core/src/models/Team";
import { useDraftView } from "./DraftViewContext";
import { useMedia } from "../hooks/useMedia";
import { useDataset } from "./DatasetContext";
import { useDraftFilters } from "./DraftFiltersContext";

type TeamPick = {
    championKey: string | undefined;
    role: Role | undefined;
    hoverKey: string | undefined;
};

type TeamPicks = [TeamPick, TeamPick, TeamPick, TeamPick, TeamPick];

type Selection = {
    team: Team | undefined;
    index: number;
};

export function createDraftContext() {
    const { dataset } = useDataset();
    const { setCurrentDraftView } = useDraftView();
    const { isMobileLayout } = useMedia();
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

    const [bans, setBans] = createStore<string[]>([]);
    // If empty, assume all champions are owned
    const [ownedChampions, setOwnedChampions] = createSignal<Set<string>>(
        new Set()
    );

    function getNextPick(team: Team) {
        const picks = team === "ally" ? allyTeam : opponentTeam;

        return picks.findIndex((pick) => pick.championKey === undefined);
    }

    function fixClashes(championKey: string, index: number) {
        const allyClashingChampion = allyTeam.findIndex(
            (p) => p.championKey === championKey
        );
        if (allyClashingChampion !== -1 && allyClashingChampion !== index) {
            resetChampion("ally", allyClashingChampion);
        }
        const opponentClashingChampion = opponentTeam.findIndex(
            (p) => p.championKey === championKey
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
        } = {}
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
                hoverKey: undefined,
            });

            if (updateView) {
                setCurrentDraftView({
                    type: "draft",
                    subType: team,
                });
            }

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

            if (draftFinished() && updateView) {
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
        role: Role | undefined
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
            resetDraftFilters();
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

    return {
        allyTeam,
        opponentTeam,
        bans,
        setBans,
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
