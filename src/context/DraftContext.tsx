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
import { ChampionData } from "../lib/models/ChampionData";
import { PickData } from "../lib/models/PickData";
import { Role } from "../lib/models/Role";
import { Team } from "../lib/models/Team";
import predictRoles, { getTeamComps } from "../lib/role/role-predictor";
import { getSuggestions } from "../lib/suggestions/suggestions";

type TeamPick = {
    championKey: string | undefined;
};

type TeamPicks = [TeamPick, TeamPick, TeamPick, TeamPick, TeamPick];

const fetchDataset = async () => {
    const response = await fetch("data/datasets/12.21.1.json");
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

    function getTeamData(team: Team) {
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

    const suggestions = createMemo(() => {
        if (!dataset()) return [];

        const allyTeamComp = allyTeamComps()[0][0] ?? new Map();
        const enemyTeamComp = opponentTeamComps()[0][0] ?? new Map();

        return getSuggestions(dataset()!, allyTeamComp, enemyTeamComp);
    });

    const pickChampion = (team: "ally" | "opponent", championKey: string) => {
        if (team === "ally") {
            const index = allyTeam.findIndex((pick) => !pick.championKey);
            setAllyTeam(index, "championKey", championKey);
        } else {
            const index = opponentTeam.findIndex((pick) => !pick.championKey);
            setOpponentTeam(index, "championKey", championKey);
        }
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
        suggestions,
        pickChampion,
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

export const useDraft = () => useContext(DraftContext);
