import {
    batch,
    createContext,
    createEffect,
    createSignal,
    JSX,
    useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import {
    getChampSelectSession,
    getCurrentSummoner,
    getGridChampions,
    getOwnedChampionsMinimal,
} from "../api/lcu-api";
import { getRoleFromString, Role } from "../lib/models/Role";
import { Team } from "../lib/models/Team";
import {
    LolChampSelectChampSelectAction,
    LolChampSelectChampSelectPlayerSelection,
    LolChampSelectChampSelectSession,
    LolSummonerSummoner,
} from "../types/Lcu";
import {
    createImportFavouritePicksSuccessToast,
    createImportFavouritePicksToast,
} from "../utils/toast";
import { useDraft } from "./DraftContext";

const createChampSelectSession = (): LolChampSelectChampSelectSession => ({
    actions: [],
    allowBattleBoost: false,
    allowDuplicatePicks: false,
    allowLockedEvents: false,
    allowSkinSelection: false,
    bans: {
        myTeamBans: [],
        numBans: 0,
        theirTeamBans: [],
    },
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
    Disabled: "Disabled",
} as const;

export type ClientState = typeof ClientState[keyof typeof ClientState];

export const createLolClientContext = () => {
    const {
        isDesktop,
        pickChampion,
        select,
        resetAll,
        isFavourite,
        toggleFavourite,
        allyTeam,
        opponentTeam,
        bans,
        setBans,
        setOwnedChampions,
    } = useDraft();

    const [clientState, setClientState] = createSignal<ClientState>(
        ClientState.NotFound
    );
    const [clientError, setClientError] = createSignal<string | undefined>();
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
        session: LolChampSelectChampSelectSession,
        firstTime = false
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
            // In blind we do not know the opponent championId
            if (!selection.championId) {
                return false;
            }
            if (!completedCellIds.has(selection.cellId)) {
                return false;
            }

            const championId = String(selection.championId);

            const teamPicks = team === "ally" ? allyTeam : opponentTeam;
            if (
                teamPicks[index] &&
                teamPicks[index].championKey === championId
            ) {
                return false;
            }

            const role = selection.assignedPosition
                ? getRole(selection.assignedPosition)
                : undefined;
            const resetFilters =
                hasCurrentSummoner() &&
                currentSummoner.summonerId === selection.summonerId;
            pickChampion(team, index, championId, role, {
                updateSelection: false,
                resetFilters,
            });

            return true;
        };

        batch(() => {
            let draftChanged = firstTime;
            for (const [selection, i] of session.myTeam.map(
                (s, i) => [s, i] as const
            )) {
                draftChanged =
                    processSelection(selection, "ally", i) || draftChanged;
            }
            for (const [selection, i] of session.theirTeam.map(
                (s, i) => [s, i] as const
            )) {
                draftChanged =
                    processSelection(selection, "opponent", i) || draftChanged;
            }

            console.log(session);
            const bannedChampions = [
                ...session.bans.myTeamBans,
                ...session.bans.theirTeamBans,
            ].map((b) => String(b));
            if (
                bannedChampions.length !== bans.length ||
                bannedChampions.some((b, i) => b !== bans[i])
            ) {
                setBans(bannedChampions);
            }

            if (nextPick && draftChanged) {
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

    const checkImportFavourites = async () => {
        const gridChampions = await getGridChampions();
        if (!gridChampions) {
            console.error("Failed to get grid champions");
            return;
        }

        const favouritePicks = gridChampions?.flatMap((c) =>
            c.positionsFavorited.map((p) => ({
                championKey: c.id.toString(),
                role: getRoleFromString(p as any),
            }))
        );

        const nonFavouritePicks = favouritePicks.filter(
            (f) => !isFavourite(f.championKey, f.role)
        );

        if (favouritePicks.every((f) => isFavourite(f.championKey, f.role))) {
            return;
        }

        createImportFavouritePicksToast(() => {
            for (const nonFavourite of nonFavouritePicks) {
                toggleFavourite(nonFavourite.championKey, nonFavourite.role);
            }

            createImportFavouritePicksSuccessToast(nonFavouritePicks.length);
        });
    };

    const updateUnownedChampions = async () => {
        const ownedChampions = await getOwnedChampionsMinimal();
        if (!ownedChampions) {
            console.error("Failed to get owned champions");
            return;
        }

        setOwnedChampions(new Set(ownedChampions.map((c) => c.id.toString())));
    };

    let [integrationTimeout, setIntegrationTimeout] = createSignal<
        NodeJS.Timeout | undefined
    >();

    const startLolClientIntegration = () => {
        if (!isDesktop) return () => {};

        const update = async () => {
            try {
                if (!hasCurrentSummoner()) {
                    const summoner = await getCurrentSummoner();
                    if (summoner) {
                        setCurrentSummoner(summoner);
                        setHasCurrentSummoner(true);
                    }
                }

                const session = await getChampSelectSession();
                if (session == null) {
                    if (clientState() !== ClientState.MainMenu) {
                        setBans([]);
                        setOwnedChampions(new Set<string>());
                    }

                    setClientState(ClientState.MainMenu);
                } else {
                    batch(() => {
                        if (clientState() !== ClientState.InChampSelect) {
                            updateUnownedChampions();
                            checkImportFavourites();
                            resetAll();
                            setBans([]);
                        }

                        updateChampSelectSession(
                            session,
                            clientState() !== ClientState.InChampSelect
                        );
                        setClientState(ClientState.InChampSelect);
                    });
                }
                setClientError(undefined);
            } catch (e) {
                setClientState(ClientState.NotFound);
                setClientError((e as any).toString());
            }

            const timeoutMs = {
                [ClientState.MainMenu]: 1000,
                [ClientState.InChampSelect]: 500,
                [ClientState.NotFound]: 2000,
                [ClientState.Disabled]: 2000,
            }[clientState()];
            setIntegrationTimeout(setTimeout(() => update(), timeoutMs));
        };
        update();

        return () => {
            setClientState(ClientState.NotFound);
            if (integrationTimeout() != null) {
                clearTimeout(integrationTimeout());
            }
        };
    };

    const stopLolClientIntegration = () => {
        if (integrationTimeout() != null) {
            clearTimeout(integrationTimeout());
        }
        setClientState(ClientState.Disabled);
    };

    return {
        clientState,
        champSelectSession,
        startLolClientIntegration,
        stopLolClientIntegration,
        clientError,
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
