import {
    batch,
    createContext,
    createMemo,
    createResource,
    createSignal,
    JSXElement,
    useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { getTeamDamageDistribution } from "../lib/damage-distribution/damage-distribution";
import { getDeserializedDataset } from "../lib/models/Dataset";
import { PickData } from "../lib/models/PickData";
import { displayNameByRole, Role } from "../lib/models/Role";
import { Team } from "../lib/models/Team";
import predictRoles, { getTeamComps } from "../lib/role/role-predictor";
import {
    analyzeDraft,
    AnalyzeDraftConfig,
    getSuggestions,
} from "../lib/suggestions/suggestions";
import { createStoredSignal } from "../utils/signals";

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

// const fetchDataset = async () => {
//     console.time("all");

//     console.time("fetch");
//     const response = await fetch("data/datasets/30.json");
//     console.timeEnd("fetch");

//     console.time("json");
//     const json = await response.json();
//     console.timeEnd("json");

//     console.timeEnd("all");

//     return json as Dataset;
// };

const fetchBinDataset = async () => {
    const response = await fetch(
        "https://bucket.draftgap.com/datasets/latest.bin"
    );
    const arrayBuffer = await response.arrayBuffer();

    const deserialized = getDeserializedDataset(arrayBuffer);
    return deserialized;
};

export function createDraftContext() {
    const isDesktop = (window as any).__TAURI__ !== undefined;

    const [dataset] = createResource(fetchBinDataset);

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

    const [search, setSearch] = createSignal("");
    const [roleFilter, setRoleFilter] = createSignal<Role>();
    const [favouriteFilter, setFavouriteFilter] = createSignal(false);
    const [config, setConfig] = createStoredSignal<AnalyzeDraftConfig>(
        "draftgap-config",
        {
            ignoreChampionWinrates: false,
            riskLevel: "medium",
            minGames: 1000,
        }
    );

    function getTeamCompsForTeam(team: Team) {
        if (!dataset()) return [];

        const picks = team === "ally" ? allyTeam : opponentTeam;

        const championData = picks
            .filter((pick) => pick.championKey)
            .map((pick) => ({
                ...dataset()!.championData[pick.championKey!],
                role: pick.role,
            }));
        return getTeamComps(championData);
    }

    const allyTeamComps = createMemo(() => getTeamCompsForTeam("ally"));
    const opponentTeamComps = createMemo(() => getTeamCompsForTeam("opponent"));

    const allyRoles = createMemo(() => predictRoles(allyTeamComps()));
    const opponentRoles = createMemo(() => predictRoles(opponentTeamComps()));

    const allyDraftResult = createMemo(() => {
        if (!dataset()) return undefined;
        return analyzeDraft(
            dataset()!,
            allyTeamComps()[0][0],
            opponentTeamComps()[0][0],
            config()
        );
    });
    const opponentDraftResult = createMemo(() => {
        if (!dataset()) return undefined;
        return analyzeDraft(
            dataset()!,
            opponentTeamComps()[0][0],
            allyTeamComps()[0][0],
            config()
        );
    });

    const allyDamageDistribution = createMemo(() => {
        if (!dataset()) return undefined;
        if (!allyTeamComps().length) return undefined;
        return getTeamDamageDistribution(dataset()!, allyTeamComps()[0][0]);
    });

    const opponentDamageDistribution = createMemo(() => {
        if (!dataset()) return undefined;
        if (!opponentTeamComps().length) return undefined;
        return getTeamDamageDistribution(dataset()!, opponentTeamComps()[0][0]);
    });

    function getTeamData(team: Team): Map<string, PickData> {
        if (!dataset()) return new Map();

        const picks = team === "ally" ? allyTeam : opponentTeam;
        const roles = team === "ally" ? allyRoles() : opponentRoles();

        const teamData = new Map<string, PickData>();

        for (const { championKey } of picks) {
            if (!championKey) continue;
            const championData = dataset()!.championData[championKey];
            const probabilityByRole = roles.get(championKey)!;
            teamData.set(championKey, {
                ...championData,
                probabilityByRole,
            });
        }

        return teamData;
    }

    const allyTeamData = createMemo(() => getTeamData("ally"));
    const opponentTeamData = createMemo(() => getTeamData("opponent"));

    const allySuggestions = createMemo(() => {
        if (!dataset()) return [];

        const allyTeamComp = allyTeamComps()[0][0] ?? new Map();
        const enemyTeamComp = opponentTeamComps()[0][0] ?? new Map();

        return getSuggestions(
            dataset()!,
            allyTeamComp,
            enemyTeamComp,
            config()
        );
    });

    const opponentSuggestions = createMemo(() => {
        if (!dataset()) return [];

        const allyTeamComp = allyTeamComps()[0][0] ?? new Map();
        const enemyTeamComp = opponentTeamComps()[0][0] ?? new Map();

        return getSuggestions(
            dataset()!,
            enemyTeamComp,
            allyTeamComp,
            config()
        );
    });

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
            setTab(team);

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
        team: "ally",
        index: 0,
    });

    const select = (
        team: Team | undefined,
        index: number,
        resetFilters = true
    ) => {
        setSelection("team", team);
        setSelection("index", index);
        if (resetFilters) {
            setSearch("");
            setRoleFilter(undefined);
            setFavouriteFilter(false);
        }

        if (draftFinished()) {
            setTab("draft");
        }
    };

    const draftFinished = () =>
        [...allyTeam, ...opponentTeam].every(
            (s) => s.championKey !== undefined
        );

    const [tab, setTab] = createSignal<"ally" | "opponent" | "draft">("ally");

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

    return {
        isDesktop,
        dataset,
        allyTeam,
        opponentTeam,
        allyTeamData,
        opponentTeamData,
        allyRoles,
        opponentRoles,
        allyTeamComps,
        opponentTeamComps,
        allyDraftResult,
        opponentDraftResult,
        allyDamageDistribution,
        opponentDamageDistribution,
        allySuggestions,
        opponentSuggestions,
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
        config,
        setConfig,
        tab,
        setTab,
        draftFinished,
        isFavourite,
        toggleFavourite,
    };
}

const DraftContext = createContext<ReturnType<typeof createDraftContext>>();

export function DraftProvider(props: { children: JSXElement }) {
    const ctx = createDraftContext();

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
