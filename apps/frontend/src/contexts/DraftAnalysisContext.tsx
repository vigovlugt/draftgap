import {
    JSXElement,
    createContext,
    createEffect,
    createMemo,
    createSignal,
    useContext,
} from "solid-js";
import { getVisibleChampionKey, TeamPick, useDraft } from "./DraftContext";
import { useUser } from "./UserContext";
import { getTeamDamageDistribution } from "@draftgap/core/src/damage-distribution/damage-distribution";
import { analyzeDraft } from "@draftgap/core/src/draft/analysis";
import { Team } from "@draftgap/core/src/models/Team";
import { Role } from "@draftgap/core/src/models/Role";
import { PickData } from "@draftgap/core/src/models/dataset/PickData";
import predictRoles, {
    getTeamComps,
} from "@draftgap/core/src/role/role-predictor";
import { useDataset } from "./DatasetContext";
import { useDraftFilters } from "./DraftFiltersContext";

type DraftAnalysisOptions = {
    allyTeam?: () => TeamPick[];
    opponentTeam?: () => TeamPick[];
    isPreview?: boolean;
};

export function createDraftAnalysisContext(options: DraftAnalysisOptions = {}) {
    const { config, setConfig } = useUser();
    const draft = useDraft();
    const { selection } = draft;
    const allyTeam = () => options.allyTeam?.() ?? draft.allyTeam;
    const opponentTeam = () => options.opponentTeam?.() ?? draft.opponentTeam;
    const { roleFilter, setRoleFilter } = useDraftFilters();
    const { isLoaded, dataset, dataset30Days } = useDataset();

    const analyzeHovers = () => config.analyzeHovers;
    const setAnalyzeHovers = (value: boolean) =>
        setConfig("analyzeHovers", value);

    function getTeamCompsForTeam(team: Team, excludeIndex?: number) {
        if (!isLoaded()) return [];

        const picks = team === "ally" ? allyTeam() : opponentTeam();

        const championData = picks
            .filter((_, i) => i !== excludeIndex)
            .map((pick) => ({
                key: getVisibleChampionKey(pick, analyzeHovers()),
                role: pick.role,
            }))
            .filter((pick) => pick.key !== undefined)
            .map((pick) => ({
                ...dataset()!.championData[pick.key!],
                role: pick.role,
            }));
        return getTeamComps(championData);
    }

    const allyTeamComps = createMemo(() => getTeamCompsForTeam("ally"));
    const opponentTeamComps = createMemo(() => getTeamCompsForTeam("opponent"));
    const allyTeamComp = createMemo(
        () =>
            allyTeamComps().at(0)?.[0] ??
            (new Map() as ReturnType<typeof allyTeamComps>[number][0]),
    );
    const opponentTeamComp = createMemo(
        () =>
            opponentTeamComps().at(0)?.[0] ??
            (new Map() as ReturnType<typeof opponentTeamComps>[number][0]),
    );

    /**
     * Index of the selected pick slot of `team` when it already holds a
     * champion, meaning that champion is being replaced.
     */
    const replacedIndex = (team: Team) => {
        if (options.isPreview) return undefined;
        if (selection.type !== "pick" || selection.team !== team) {
            return undefined;
        }
        const picks = team === "ally" ? allyTeam() : opponentTeam();
        return picks[selection.index]?.championKey !== undefined
            ? selection.index
            : undefined;
    };

    /** Team comp without the champion that is currently being replaced. */
    function getSuggestionTeamComp(team: Team) {
        const comp = team === "ally" ? allyTeamComp : opponentTeamComp;
        const excludeIndex = replacedIndex(team);
        if (excludeIndex === undefined) return comp();

        return (
            getTeamCompsForTeam(team, excludeIndex).at(0)?.[0] ??
            (new Map() as ReturnType<typeof comp>)
        );
    }

    const allySuggestionTeamComp = createMemo(() =>
        getSuggestionTeamComp("ally"),
    );
    const opponentSuggestionTeamComp = createMemo(() =>
        getSuggestionTeamComp("opponent"),
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
            draftAnalysisConfig(),
        );
    });
    const opponentDraftAnalysis = createMemo(() => {
        if (!isLoaded()) return undefined;
        return analyzeDraft(
            dataset()!,
            dataset30Days()!,
            opponentTeamComps()[0][0],
            allyTeamComps()[0][0],
            draftAnalysisConfig(),
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

        const picks = team === "ally" ? allyTeam() : opponentTeam();
        const roles = team === "ally" ? allyRoles() : opponentRoles();

        const teamData = new Map<string, PickData>();

        for (const pick of picks) {
            const key = getVisibleChampionKey(pick, analyzeHovers());
            if (!key) continue;

            const championData = dataset()!.championData[key];
            const probabilityByRole = roles.get(key)!;
            teamData.set(key, {
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
        const teamDraft = team === "ally" ? allyTeam() : opponentTeam();

        return new Set(teamDraft.map((p) => p.role));
    };
    const getFilledRoles = (team: Team) => {
        if (!selection.team) return new Set();

        const teamComp =
            team === "ally"
                ? allySuggestionTeamComp()
                : opponentSuggestionTeamComp();

        return new Set(teamComp.keys());
    };

    const roleFilterTeam = (): Team | undefined => {
        if (!selection.team) return undefined;
        if (selection.type === "ban") {
            return selection.team === "ally" ? "opponent" : "ally";
        }
        return selection.team;
    };

    createEffect(() => {
        if (options.isPreview) return;
        const team = roleFilterTeam();
        if (!team) return;

        const filledRoles = getFilledRoles(team);
        if (roleFilter() !== undefined && filledRoles.has(roleFilter())) {
            setRoleFilter(undefined);
        }
    });

    const [analysisPick, _setAnalysisPick] = createSignal<{
        team: Team;
        championKey: string;
    }>();
    const [showAnalysisPick, setShowAnalysisPick] = createSignal(false);

    function setAnalysisPick(
        pick: { team: Team; championKey: string } | undefined,
    ) {
        if (!pick) {
            setShowAnalysisPick(false);
            return;
        }
        _setAnalysisPick(pick);
        setShowAnalysisPick(true);
    }

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
        allySuggestionTeamComp,
        opponentSuggestionTeamComp,
        allyRoles,
        opponentRoles,
        getLockedRoles,
        getFilledRoles,
        roleFilterTeam,
        draftAnalysisConfig,
        analysisPick,
        showAnalysisPick,
        setAnalysisPick,
        analyzeHovers,
        setAnalyzeHovers,
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

export type PreviewPick = {
    team: Team;
    index: number;
    championKey: string;
    role: Role | undefined;
};

/**
 * Provides a draft analysis of the current draft with `pick` placed in its slot,
 * without modifying the actual draft.
 */
export function PreviewDraftAnalysisProvider(props: {
    pick: PreviewPick;
    children: JSXElement;
}) {
    const { allyTeam, opponentTeam } = useDraft();

    const withPreview = (team: Team, picks: TeamPick[]) =>
        team !== props.pick.team
            ? picks
            : picks.map((p, i) =>
                  i === props.pick.index
                      ? {
                            championKey: props.pick.championKey,
                            role: props.pick.role,
                            hover: false,
                        }
                      : p,
              );

    const ctx = createDraftAnalysisContext({
        allyTeam: () => withPreview("ally", allyTeam),
        opponentTeam: () => withPreview("opponent", opponentTeam),
        isPreview: true,
    });

    return (
        <DraftAnalysisContext.Provider value={ctx}>
            {props.children}
        </DraftAnalysisContext.Provider>
    );
}

export function useDraftAnalysis() {
    const useCtx = useContext(DraftAnalysisContext);
    if (!useCtx) throw new Error("No DraftAnalysisContext found");

    return useCtx;
}
