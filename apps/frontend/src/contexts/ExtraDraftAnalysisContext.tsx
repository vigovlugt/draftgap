import { JSXElement, createContext, createMemo, useContext } from "solid-js";
import { analyzeDraftExtra } from "@draftgap/core/src/draft/extra-analysis";
import { useDataset } from "./DatasetContext";
import { useUser } from "./UserContext";
import { useDraftAnalysis } from "./DraftAnalysisContext";

export function createExtraDraftAnalysisContext() {
    const { config } = useUser();
    const { allyTeamComp, opponentTeamComp } = useDraftAnalysis();
    const { dataset, dataset30Days } = useDataset();

    const allyDraftExtraAnalysis = createMemo(() => {
        if (!dataset() || !dataset30Days()) return undefined;
        return analyzeDraftExtra(
            dataset()!,
            dataset30Days()!,
            allyTeamComp(),
            opponentTeamComp(),
            config
        );
    });

    const opponentDraftExtraAnalysis = createMemo(() => {
        if (!dataset() || !dataset30Days()) return undefined;
        return analyzeDraftExtra(
            dataset()!,
            dataset30Days()!,
            opponentTeamComp(),
            allyTeamComp(),
            config
        );
    });

    return {
        allyDraftExtraAnalysis,
        opponentDraftExtraAnalysis,
    };
}

export const ExtraDraftAnalysisContext =
    createContext<ReturnType<typeof createExtraDraftAnalysisContext>>();

export function ExtraDraftAnalysisProvider(props: { children: JSXElement }) {
    return (
        <ExtraDraftAnalysisContext.Provider
            value={createExtraDraftAnalysisContext()}
        >
            {props.children}
        </ExtraDraftAnalysisContext.Provider>
    );
}

export function useExtraDraftAnalysis() {
    const useCtx = useContext(ExtraDraftAnalysisContext);
    if (!useCtx) throw new Error("No DraftAnalysisContext found");

    return useCtx;
}
