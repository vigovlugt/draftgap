import {
    Accessor,
    createContext,
    createMemo,
    createResource,
    JSXElement,
    Resource,
    useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { getTeamDamageDistribution } from "../lib/damage-distribution/damage-distribution";
import { ChampionData } from "../lib/models/ChampionData";
import { PickData } from "../lib/models/PickData";
import { Role } from "../lib/models/Role";
import { Team } from "../lib/models/Team";
import predictRoles, { getTeamComps } from "../lib/role/role-predictor";
import { analyzeDraft, getSuggestions } from "../lib/suggestions/suggestions";

type TeamPick = {
    championKey: string | undefined;
};

type TeamPicks = [TeamPick, TeamPick, TeamPick, TeamPick, TeamPick];

type Selection = {
    team: Team | undefined;
    index: number;
};

const fetchDataset = async () => {
    const response = await fetch("data/datasets/30.json");
    return (await response.json()) as Record<string, ChampionData>;
};

export function createDraftContext() {
    const [dataset] = createResource(fetchDataset);

    const [allyTeam, setAllyTeam] = createStore<TeamPicks>([
        { championKey: undefined },
        { championKey: undefined },
        { championKey: undefined },
        { championKey: undefined },
        { championKey: undefined },
    ]);
    const [opponentTeam, setOpponentTeam] = createStore<TeamPicks>([
        { championKey: undefined },
        { championKey: undefined },
        { championKey: undefined },
        { championKey: undefined },
        { championKey: undefined },
    ]);

    function getTeamCompsForTeam(team: Team) {
        if (!dataset()) return [];

        const picks = team === "ally" ? allyTeam : opponentTeam;

        const championData = picks
            .map((pick) => pick.championKey)
            .filter((champion): champion is string => champion !== undefined)
            .map((key) => dataset()![key]);
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
            opponentTeamComps()[0][0]
        );
    });
    const opponentDraftResult = createMemo(() => {
        if (!dataset()) return undefined;
        return analyzeDraft(
            dataset()!,
            opponentTeamComps()[0][0],
            allyTeamComps()[0][0]
        );
    });

    const allyDamageDistribution = createMemo(() => {
        if (!dataset()) return undefined;
        return getTeamDamageDistribution(dataset()!, allyTeamComps()[0][0]);
    });

    const opponentDamageDistribution = createMemo(() => {
        if (!dataset()) return undefined;
        return getTeamDamageDistribution(dataset()!, opponentTeamComps()[0][0]);
    });

    function getTeamData(team: Team): Map<string, PickData> {
        if (!dataset()) return new Map();

        const picks = team === "ally" ? allyTeam : opponentTeam;
        const roles = team === "ally" ? allyRoles() : opponentRoles();

        const teamData = new Map<string, PickData>();

        for (const { championKey } of picks) {
            if (!championKey) continue;
            const championData = dataset()![championKey];
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

        return getSuggestions(dataset()!, allyTeamComp, enemyTeamComp);
    });

    const opponentSuggestions = createMemo(() => {
        if (!dataset()) return [];

        const allyTeamComp = allyTeamComps()[0][0] ?? new Map();
        const enemyTeamComp = opponentTeamComps()[0][0] ?? new Map();

        return getSuggestions(dataset()!, enemyTeamComp, allyTeamComp);
    });

    const pickChampion = (
        team: "ally" | "opponent",
        index: number,
        championKey: string
    ) => {
        if (team === "ally") {
            setAllyTeam(index, "championKey", championKey);
        } else {
            setOpponentTeam(index, "championKey", championKey);
        }
    };

    const [selection, setSelection] = createStore<Selection>({
        team: undefined,
        index: 0,
    });

    const select = (team: Team | undefined, index: number) => {
        setSelection("team", team);
        setSelection("index", index);
    };

    return {
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
