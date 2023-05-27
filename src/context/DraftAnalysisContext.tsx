import {
    JSXElement,
    createContext,
    createEffect,
    createMemo,
    useContext,
} from "solid-js";
import { useDraft } from "./DraftContext";
import { useConfig } from "./ConfigContext";
import { getTeamDamageDistribution } from "../lib/damage-distribution/damage-distribution";
import { analyzeDraft } from "../lib/draft/analysis";
import { Team } from "../lib/models/Team";
import { PickData } from "../lib/models/dataset/PickData";
import predictRoles, { getTeamComps } from "../lib/role/role-predictor";
import { useDataset } from "./DatasetContext";

export function createDraftAnalysisContext() {
    const { config } = useConfig();
    const { allyTeam, opponentTeam, selection, roleFilter, setRoleFilter } =
        useDraft();
    const { isLoaded, dataset, dataset30Days } = useDataset();

    function getTeamCompsForTeam(team: Team) {
        if (!isLoaded()) return [];

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
    const allyTeamComp = createMemo(
        () =>
            allyTeamComps().at(0)?.[0] ??
            (new Map() as ReturnType<typeof allyTeamComps>[number][0])
    );
    const opponentTeamComp = createMemo(
        () =>
            opponentTeamComps().at(0)?.[0] ??
            (new Map() as ReturnType<typeof opponentTeamComps>[number][0])
    );

    const allyRoles = createMemo(() => predictRoles(allyTeamComps()));
    const opponentRoles = createMemo(() => predictRoles(opponentTeamComps()));

    const draftAnalysisConfig = () => ({
        ignoreChampionWinrates: config.ignoreChampionWinrates,
        riskLevel: config.riskLevel,
        minGames: config.minGames,
    });

    const allyDraftAnalysis = createMemo(() => {
        if (!isLoaded()) return undefined;
        return analyzeDraft(
            dataset()!,
            dataset30Days()!,
            allyTeamComps()[0][0],
            opponentTeamComps()[0][0],
            draftAnalysisConfig()
        );
    });
    const opponentDraftAnalysis = createMemo(() => {
        if (!isLoaded()) return undefined;
        return analyzeDraft(
            dataset()!,
            dataset30Days()!,
            opponentTeamComps()[0][0],
            allyTeamComps()[0][0],
            draftAnalysisConfig()
        );
    });

    const allyDamageDistribution = createMemo(() => {
        if (!isLoaded()) return undefined;
        if (!allyTeamComps().length) return undefined;
        return getTeamDamageDistribution(dataset()!, allyTeamComps()[0][0]);
    });

    const opponentDamageDistribution = createMemo(() => {
        if (!isLoaded()) return undefined;
        if (!opponentTeamComps().length) return undefined;
        return getTeamDamageDistribution(dataset()!, opponentTeamComps()[0][0]);
    });

    function getTeamData(team: Team): Map<string, PickData> {
        if (!isLoaded()) return new Map();

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

    const getLockedRoles = (team: Team) => {
        if (!selection.team) return new Set();
        const teamDraft = team === "ally" ? allyTeam : opponentTeam;

        return new Set(teamDraft.map((p) => p.role));
    };
    const getFilledRoles = (team: Team) => {
        if (!selection.team) return new Set();

        const teamComp =
            team === "ally"
                ? allyTeamComps().at(0)?.[0]
                : opponentTeamComps().at(0)?.[0];
        if (!teamComp) return new Set();

        return new Set(teamComp.keys());
    };

    createEffect(() => {
        if (!selection.team) return;

        const filledRoles = getFilledRoles(selection.team!);
        if (roleFilter() !== undefined && filledRoles.has(roleFilter())) {
            setRoleFilter(undefined);
        }
    });

    return {
        allyTeamData,
        opponentTeamData,
        allyDraftAnalysis,
        opponentDraftAnalysis,
        allyDamageDistribution,
        opponentDamageDistribution,
        allyTeamComps,
        opponentTeamComps,
        allyTeamComp,
        opponentTeamComp,
        allyRoles,
        opponentRoles,
        getLockedRoles,
        getFilledRoles,
        draftAnalysisConfig,
    };
}

export const DraftAnalysisContext =
    createContext<ReturnType<typeof createDraftAnalysisContext>>();

export function DraftAnalysisProvider(props: { children: JSXElement }) {
    return (
        <DraftAnalysisContext.Provider value={createDraftAnalysisContext()}>
            {props.children}
        </DraftAnalysisContext.Provider>
    );
}

export function useDraftAnalysis() {
    const useCtx = useContext(DraftAnalysisContext);
    if (!useCtx) throw new Error("No DraftAnalysisContext found");

    return useCtx;
}