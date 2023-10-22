import { useQueryClient, createQuery } from "@tanstack/solid-query";
import {
    JSXElement,
    createContext,
    createEffect,
    createMemo,
    createSignal,
    useContext,
} from "solid-js";
import { analyzeBuild } from "@draftgap/core/src/builds/analysis";
import { fetchBuildData } from "@draftgap/core/src/builds/data";
import {
    PartialBuildDataset,
    FullBuildDataset,
} from "@draftgap/core/src/models/build/BuildDataset";
import { useDraft } from "./DraftContext";
import { Team } from "@draftgap/core/src/models/Team";
import { BuildEntity } from "@draftgap/core/src/models/build/BuildEntity";
import { useDraftAnalysis } from "./DraftAnalysisContext";
import { useDataset } from "./DatasetContext";
import { useDraftView } from "./DraftViewContext";

export function createBuildContext() {
    const { allyTeam, opponentTeam } = useDraft();
    const { dataset, dataset30Days } = useDataset();
    const { allyTeamComp, opponentTeamComp, draftAnalysisConfig } =
        useDraftAnalysis();
    const { currentDraftView } = useDraftView();

    const [buildPick, _setBuildPick] = createSignal<{
        team: Team;
        index: number;
    }>();

    function setBuildPick(pick: { team: Team; index: number } | undefined) {
        const teamPicks = pick?.team === "ally" ? allyTeam : opponentTeam;
        const teamComp =
            pick?.team === "ally" ? allyTeamComp() : opponentTeamComp();
        gtag("event", "set_build_pick", {
            event_category: "build",
            team: pick?.team,
            index: pick?.index,
            champion_key: pick ? teamPicks[pick!.index].championKey : undefined,
            champion_name: pick
                ? dataset()!.championData[teamPicks[pick!.index].championKey!]
                      .name
                : undefined,
            role: pick
                ? [...teamComp!.entries()].find(
                      ([, key]) => key === teamPicks[pick!.index].championKey
                  )?.[0]
                : undefined,
        });

        _setBuildPick(pick);
    }

    createEffect(() => {
        if (!buildPick()) return;

        const team = buildPick()!.team === "ally" ? allyTeam : opponentTeam;
        const championKey = team[buildPick()!.index].championKey;
        if (championKey) return;

        _setBuildPick(undefined);
    });

    const [selectedEntity, _setSelectedEntity] = createSignal<
        BuildEntity | undefined
    >();
    const [showSelectedEntity, setShowSelectedEntity] = createSignal(false);
    const setSelectedEntity = (entity: BuildEntity | undefined) => {
        if (!entity) {
            setShowSelectedEntity(false);
            return;
        }

        _setSelectedEntity(entity);
        setShowSelectedEntity(true);
    };

    const team = () => (buildPick()?.team === "ally" ? allyTeam : opponentTeam);
    const championKey = () =>
        buildPick() ? team()[buildPick()!.index].championKey : undefined;
    const myTeamComp = () => {
        if (!buildPick()) return undefined;
        return buildPick()!.team === "ally"
            ? allyTeamComp()
            : opponentTeamComp();
    };
    const theirTeamComp = () => {
        if (!buildPick()) return undefined;
        return buildPick()!.team === "ally"
            ? opponentTeamComp()
            : allyTeamComp();
    };
    const championRole = () => {
        if (!buildPick() || !myTeamComp()) return undefined;
        return [...myTeamComp()!.entries()].find(
            ([, key]) => key === championKey()
        )?.[0];
    };

    const queryClient = useQueryClient();
    const query = createQuery(() => ({
        queryKey: [
            "build",
            championKey(),
            championRole(),
            theirTeamComp() ? Object.fromEntries(theirTeamComp()!) : undefined,
            dataset(),
        ],
        queryFn: async (ctx) => {
            if (championKey() === undefined || !theirTeamComp() || !dataset()) {
                return null;
            }

            const cached = queryClient.getQueryCache().find({
                queryKey: ctx.queryKey,
            });
            if (cached?.state?.data && cached.state.error == null) {
                return cached.state.data as [
                    PartialBuildDataset,
                    FullBuildDataset
                ];
            }

            return await fetchBuildData(
                dataset()!,
                championKey()!,
                championRole()!,
                theirTeamComp()!
            );
        },
        refetchInterval: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
        get enabled() {
            return buildPick() != null && currentDraftView().type === "builds";
        },
    }));
    createEffect(() => {
        if (query.isError) {
            console.error("Error while fetching build data", query.error);
        }
    });

    const partialBuildDataset = () => query.data?.[0];
    const fullBuildDataset = () => query.data?.[1];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).DRAFTGAP_DEBUG.fullBuildDataset = fullBuildDataset;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).DRAFTGAP_DEBUG.partialBuildDataset = partialBuildDataset;

    const buildAnalysisResult = createMemo(() => {
        if (!query.data || !dataset() || !dataset30Days()) {
            return;
        }
        return analyzeBuild(
            dataset()!,
            dataset30Days()!,
            ...query.data,
            draftAnalysisConfig()
        );
    });

    return {
        query,
        championKey,
        championRole,
        partialBuildDataset,
        fullBuildDataset,
        buildAnalysisResult,
        buildPick,
        setBuildPick,
        selectedEntity,
        showSelectedEntity,
        setSelectedEntity,
    };
}

const BuildContext = createContext<ReturnType<typeof createBuildContext>>();

export function BuildProvider(props: { children: JSXElement }) {
    const ctx = createBuildContext();

    return (
        <BuildContext.Provider value={ctx}>
            {props.children}
        </BuildContext.Provider>
    );
}

export const useBuild = () => {
    const useCtx = useContext(BuildContext);
    if (!useCtx) throw new Error("No BuildContext found");

    return useCtx;
};
