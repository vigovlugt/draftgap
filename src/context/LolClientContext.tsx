import {
    batch,
    createContext,
    createEffect,
    createSignal,
    JSX,
    useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { getChampSelectSession, getCurrentSummoner } from "../api/lcu-api";
import { Role } from "../lib/models/Role";
import { Team } from "../lib/models/Team";
import {
    LolChampSelectChampSelectAction,
    LolChampSelectChampSelectPlayerSelection,
    LolChampSelectChampSelectSession,
    LolSummonerSummoner,
} from "../types/Lcu";
import { useDraft } from "./DraftContext";

const createChampSelectSession = (): LolChampSelectChampSelectSession => ({
    actions: [],
    allowBattleBoost: false,
    allowDuplicatePicks: false,
    allowLockedEvents: false,
    allowSkinSelection: false,
    bans: [],
    benchChampionIds: [],
    benchEnabled: false,
    boostableSkinCount: 0,
    chatDetails: {
        chatRoomName: "",
        chatRoomPassword: "",
    },
    counter: 0,
    entitledFeatureState: {
        additionalRerolls: 0,
        unlockedSkinIds: [],
    },
    gameId: 0,
    hasSimultaneousBans: false,
    hasSimultaneousPicks: false,
    isCustomGame: false,
    isSpectating: false,
    localPlayerCellId: 0,
    lockedEventIndex: 0,
    myTeam: [],
    recoveryCounter: 0,
    rerollsRemaining: 0,
    skipChampionSelect: false,
    theirTeam: [],
    timer: {
        adjustedTimeLeftInPhase: 0,
        internalNowInEpochMs: 0,
        isInfinite: false,
        phase: "",
        totalTimeInPhase: 0,
    },
    trades: [],
});

export const ClientState = {
    NotFound: "NotFound",
    MainMenu: "MainMenu",
    InChampSelect: "InChampSelect",
} as const;

export type ClientState = typeof ClientState[keyof typeof ClientState];

export const createLolClientContext = () => {
    const { isDesktop, pickChampion, select, resetAll } = useDraft();

    const [clientState, setClientState] = createSignal<ClientState>(
        ClientState.NotFound
    );
    const [champSelectSession, setChampSelectSession] =
        createStore<LolChampSelectChampSelectSession>(
            createChampSelectSession()
        );
    const [hasCurrentSummoner, setHasCurrentSummoner] = createSignal(false);
    const [currentSummoner, setCurrentSummoner] =
        createStore<LolSummonerSummoner>({
            displayName: "",
            internalName: "",
            percentCompleteForNextLevel: 0,
            profileIconId: 0,
            puuid: "",
            rerollPoints: {
                currentPoints: 0,
                maxRolls: 0,
                numberOfRolls: 0,
                pointsCostToRoll: 0,
                pointsToReroll: 0,
            },
            summonerId: 0,
            summonerLevel: 0,
            xpSinceLastLevel: 0,
            xpUntilNextLevel: 0,
            accountId: "",
            nameChangeFlag: false,
            privacy: "",
        });

    const updateChampSelectSession = (
        session: LolChampSelectChampSelectSession
    ) => {
        const getCompletedCellIds = (
            actions: LolChampSelectChampSelectAction[]
        ) => {
            const set = new Set<number>();
            for (const action of actions) {
                if (action.type !== "pick") {
                    continue;
                }
                if (!action.completed) {
                    continue;
                }
                set.add(action.actorCellId);
            }
            return set;
        };
        const completedCellIds = getCompletedCellIds(session.actions.flat());

        const nextPick = session.actions
            .flat()
            .find((a) => a.type === "pick" && !a.completed);

        const getRole = (role: string) => {
            return {
                top: Role.Top,
                jungle: Role.Jungle,
                bottom: Role.Bottom,
                middle: Role.Middle,
                utility: Role.Support,
            }[role];
        };

        const processSelection = (
            selection: LolChampSelectChampSelectPlayerSelection,
            team: Team,
            index: number
        ) => {
            // In blind we do not know the enemy championId
            if (!selection.championId) {
                return;
            }
            if (!completedCellIds.has(selection.cellId)) {
                return;
            }

            const championId = String(selection.championId);
            const role = selection.assignedPosition
                ? getRole(selection.assignedPosition)
                : undefined;
            const resetFilters =
                hasCurrentSummoner() &&
                currentSummoner.summonerId === selection.summonerId;
            pickChampion(team, index, championId, role, false, resetFilters);
        };

        batch(() => {
            for (const [selection, i] of session.myTeam.map(
                (s, i) => [s, i] as const
            )) {
                processSelection(selection, "ally", i);
            }
            for (const [selection, i] of session.theirTeam.map(
                (s, i) => [s, i] as const
            )) {
                processSelection(selection, "opponent", i);
            }

            if (nextPick) {
                const nextPickTeamSelection = nextPick.isAllyAction
                    ? session.myTeam
                    : session.theirTeam;
                const index = nextPickTeamSelection.findIndex(
                    (s) => s.cellId === nextPick.actorCellId
                );
                select(
                    nextPick.isAllyAction ? "ally" : "opponent",
                    index,
                    false
                );
            }

            setChampSelectSession(session);
        });
    };

    const startLolClientIntegration = () => {
        if (!isDesktop) return () => {};

        let timeout: NodeJS.Timeout | undefined;
        const update = async () => {
            try {
                if (!hasCurrentSummoner()) {
                    const summoner = await getCurrentSummoner();
                    if (summoner) {
                        console.log("Summoner:", summoner);
                        setCurrentSummoner(summoner);
                        setHasCurrentSummoner(true);
                    }
                }

                const session = await getChampSelectSession();
                console.log("Session:", session);
                if (session == null) {
                    setClientState(ClientState.MainMenu);
                } else {
                    batch(() => {
                        if (clientState() !== ClientState.InChampSelect) {
                            resetAll();
                        }

                        setClientState(ClientState.InChampSelect);
                        updateChampSelectSession(session);
                    });
                }
            } catch (e) {
                console.log("Session error:", e);
                setClientState(ClientState.NotFound);
            }

            const timeoutMs = {
                [ClientState.MainMenu]: 1000,
                [ClientState.InChampSelect]: 500,
                [ClientState.NotFound]: 2000,
            }[clientState()];
            timeout = setTimeout(() => update(), timeoutMs);
        };
        update();

        return () => {
            setClientState(ClientState.NotFound);
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    };

    return {
        clientState,
        champSelectSession,
        startLolClientIntegration,
    };
};

export const LolClientContext =
    createContext<ReturnType<typeof createLolClientContext>>();

export function LolClientProvider(props: { children: JSX.Element }) {
    const ctx = createLolClientContext();

    return (
        <LolClientContext.Provider value={ctx}>
            {props.children}
        </LolClientContext.Provider>
    );
}

export const useLolClient = () => {
    const useCtx = useContext(LolClientContext);
    if (!useCtx) throw new Error("No LolClientContext found");

    return useCtx;
};
