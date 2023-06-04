import { JSXElement, createContext, createMemo, useContext } from "solid-js";
import { getSuggestions } from "../lib/draft/suggestions";
import { useDraftAnalysis } from "./DraftAnalysisContext";
import { useDataset } from "./DatasetContext";

export function createDraftSuggestionsContext() {
    const { isLoaded, dataset, dataset30Days } = useDataset();
    const { draftAnalysisConfig, allyTeamComp, opponentTeamComp } =
        useDraftAnalysis();

    const allySuggestions = createMemo(() => {
        if (!isLoaded()) return [];

        return getSuggestions(
            dataset()!,
            dataset30Days()!,
            allyTeamComp(),
            opponentTeamComp(),
            draftAnalysisConfig()
        );
    });

    const opponentSuggestions = createMemo(() => {
        if (!isLoaded()) return [];

        return getSuggestions(
            dataset()!,
            dataset30Days()!,
            opponentTeamComp(),
            allyTeamComp(),
            draftAnalysisConfig()
        );
    });

    return { allySuggestions, opponentSuggestions };
}

export const DraftSuggestionsContext =
    createContext<ReturnType<typeof createDraftSuggestionsContext>>();

export function DraftSuggestionsProvider(props: { children: JSXElement }) {
    return (
        <DraftSuggestionsContext.Provider
            value={createDraftSuggestionsContext()}
        >
            {props.children}
        </DraftSuggestionsContext.Provider>
    );
}

export function useDraftSuggestions() {
    const useCtx = useContext(DraftSuggestionsContext);
    if (!useCtx) throw new Error("No DraftSuggestionsContext found");

    return useCtx;
}
