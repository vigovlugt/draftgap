import {
    createContext,
    createMemo,
    createResource,
    createSignal,
    JSXElement,
    useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { getTeamDamageDistribution } from "../lib/damage-distribution/damage-distribution";
import { Dataset, getDeserializedDataset } from "../lib/models/Dataset";
import { PickData } from "../lib/models/PickData";
import { Role } from "../lib/models/Role";
import { Team } from "../lib/models/Team";
import predictRoles, { getTeamComps } from "../lib/role/role-predictor";
import { analyzeDraft, getSuggestions } from "../lib/suggestions/suggestions";

type TeamPick = {
    championKey: string | undefined;
    role: Role | undefined;
};

type TeamPicks = [TeamPick, TeamPick, TeamPick, TeamPick, TeamPick];

type Selection = {
    team: Team | undefined;
    index: number;
};

const fetchDataset = async () => {
    console.time("all");

    console.time("fetch");
    const response = await fetch("data/datasets/30.json");
    console.timeEnd("fetch");

    console.time("json");
    const json = await response.json();
    console.timeEnd("json");

    console.timeEnd("all");

    return json as Dataset;
};

const fetchBinDataset = async () => {
    console.time("all");
    console.time("fetch");
    const response = await fetch(
        "https://bucket.draftgap.com/datasets/12.22.1.bin"
    );
    console.timeEnd("fetch");

    console.time("arrayBuffer");
    const arrayBuffer = await response.arrayBuffer();
    console.timeEnd("arrayBuffer");

    console.time("deserialize");
    const deserialized = getDeserializedDataset(arrayBuffer);
    console.timeEnd("deserialize");

    console.timeEnd("all");

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

    const [config, setConfig] = createStore({
        ignoreChampionWinrates: false,
    });

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
            {
                ignoreChampionWinrates: config.ignoreChampionWinrates,
            }
        );
    });
    const opponentDraftResult = createMemo(() => {
        if (!dataset()) return undefined;
        return analyzeDraft(
            dataset()!,
            opponentTeamComps()[0][0],
            allyTeamComps()[0][0],
            {
                ignoreChampionWinrates: config.ignoreChampionWinrates,
            }
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

        return getSuggestions(dataset()!, allyTeamComp, enemyTeamComp, {
            ignoreChampionWinrates: config.ignoreChampionWinrates,
        });
    });

    const opponentSuggestions = createMemo(() => {
        if (!dataset()) return [];

        const allyTeamComp = allyTeamComps()[0][0] ?? new Map();
        const enemyTeamComp = opponentTeamComps()[0][0] ?? new Map();

        return getSuggestions(dataset()!, enemyTeamComp, allyTeamComp, {
            ignoreChampionWinrates: config.ignoreChampionWinrates,
        });
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
        updateSelection = true,
        resetFilters = true
    ) => {
        if (team === "ally") {
            setAllyTeam(index, "championKey", championKey);
            setAllyTeam(index, "role", role);
        } else {
            setOpponentTeam(index, "championKey", championKey);
            setOpponentTeam(index, "role", role);
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

        if (resetFilters) {
            setSearch("");
            setRoleFilter(undefined);
        }
    };

    const [selection, setSelection] = createStore<Selection>({
        team: "ally",
        index: 0,
    });

    const select = (team: Team | undefined, index: number) => {
        setSelection("team", team);
        setSelection("index", index);
        setSearch("");
        setRoleFilter(undefined);
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
        selection,
        select,
        search,
        roleFilter,
        setSearch,
        setRoleFilter,
        config,
        setConfig,
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
