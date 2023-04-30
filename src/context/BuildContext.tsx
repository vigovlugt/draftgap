import { useQueryClient, createQuery } from "@tanstack/solid-query";
import {
    JSXElement,
    createContext,
    createEffect,
    createMemo,
    createSignal,
    useContext,
} from "solid-js";
import { analyzeBuild } from "../lib/builds/analysis";
import { fetchBuildData } from "../lib/builds/data";
import {
    PartialBuildDataset,
    FullBuildDataset,
} from "../lib/models/build/BuildDataset";
import { useDraft } from "./DraftContext";
import { Team } from "../lib/models/Team";
import { BuildEntity } from "../lib/models/build/BuildEntity";
import { C } from "@tauri-apps/api/event-2a9960e7";

export function createBuildContext() {
    const {
        allyTeam,
        opponentTeam,
        dataset,
        dataset30Days,
        allyTeamComps,
        opponentTeamComps,
        config,
    } = useDraft();

    const [buildPick, setBuildPick] = createSignal(
        undefined as { team: Team; index: number } | undefined
    );
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

    createEffect(() => {
        if (!buildPick()) return;

        let allDefined = true;
        for (let i = 0; i < 5; i++) {
            allDefined &&= !!allyTeam[i].championKey;
            allDefined &&= !!opponentTeam[i].championKey;
        }
        if (allDefined) return;

        setBuildPick(undefined);
    }, [allyTeam, opponentTeam]);

    const team = () => (buildPick()?.team === "ally" ? allyTeam : opponentTeam);
    const championKey = () =>
        buildPick() ? team()[buildPick()!.index].championKey : undefined;
    const allyTeamComp = () => {
        if (!buildPick()) return undefined;
        return buildPick()!.team === "ally"
            ? allyTeamComps()[0][0]
            : opponentTeamComps()[0][0];
    };
    const opponentTeamComp = () => {
        if (!buildPick()) return undefined;
        return buildPick()!.team === "ally"
            ? opponentTeamComps()[0][0]
            : allyTeamComps()[0][0];
    };
    const championRole = () => {
        if (!buildPick() || !allyTeamComp()) return undefined;
        return [...allyTeamComp()!.entries()].find(
            ([, key]) => key === championKey()
        )?.[0];
    };

    const queryClient = useQueryClient();
    const query = createQuery(
        () => [
            "build",
            championKey(),
            championRole(),
            opponentTeamComp()
                ? Object.fromEntries(opponentTeamComp()!)
                : undefined,
            dataset(),
        ],
        async (ctx) => {
            if (
                championKey() === undefined ||
                !opponentTeamComp() ||
                !dataset()
            ) {
                return null;
            }

            console.log(ctx.queryKey);
            const cached = queryClient.getQueryCache().find(ctx.queryKey);
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
                opponentTeamComp()!
            );
        },
        {
            refetchInterval: false,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
            get enabled() {
                return buildPick() != null;
            },
        }
    );
    createEffect(() => {
        if (query.isError) {
            console.error("Error while fetching build data", query.error);
        }
    });

    const partialBuildDataset = () => query.data?.[0];
    const fullBuildDataset = () => query.data?.[1];
    (window as any).DRAFTGAP_DEBUG.fullBuildDataset = fullBuildDataset;
    (window as any).DRAFTGAP_DEBUG.partialBuildDataset = partialBuildDataset;

    createEffect(() => {
        console.log("query.data", query.data);
    });

    const buildAnalysisResult = createMemo(() => {
        if (!query.data || !dataset() || !dataset30Days()) {
            return;
        }
        return analyzeBuild(
            dataset()!,
            dataset30Days()!,
            ...query.data,
            config()
        );
    });
    createEffect(() => {
        console.log("buildAnalysisResult", buildAnalysisResult());
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
