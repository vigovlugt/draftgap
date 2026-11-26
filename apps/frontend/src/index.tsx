/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { DraftProvider } from "./contexts/DraftContext";
import { LolClientProvider } from "./contexts/LolClientContext";
import { setupAnalytics } from "./utils/analytics";
import { TooltipProvider } from "./contexts/TooltipContext";
import { Toaster } from "solid-toast";
import { setupMobileVH } from "./utils/mobile";
import { QueryClient } from "@tanstack/solid-query";
import {
    PersistQueryClientProvider,
    PersistedClient,
} from "@tanstack/solid-query-persist-client";
import { del, get, set } from "idb-keyval";
import { BuildProvider } from "./contexts/BuildContext";
import { DraftViewProvider } from "./contexts/DraftViewContext";
import { UserProvider } from "./contexts/UserContext";
import { DraftSuggestionsProvider } from "./contexts/DraftSuggestionsContext";
import { DraftAnalysisProvider } from "./contexts/DraftAnalysisContext";
import { DatasetProvider } from "./contexts/DatasetContext";
import { DraftFiltersProvider } from "./contexts/DraftFiltersContext";
import { ExtraDraftAnalysisProvider } from "./contexts/ExtraDraftAnalysisContext";

setupMobileVH();
setupAnalytics();

const queryClient = new QueryClient();

// IndexedDB instead of localStorage, the datasets are too large for it.
const persister = {
    persistClient: (client: PersistedClient) => set("query-cache", client),
    restoreClient: () => get<PersistedClient>("query-cache"),
    removeClient: () => del("query-cache"),
};

render(
    () => (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister,
                dehydrateOptions: {
                    shouldDehydrateQuery: (query) =>
                        query.queryKey[0] === "dataset" &&
                        query.state.status === "success",
                },
            }}
        >
            <UserProvider>
                <DatasetProvider>
                    <TooltipProvider>
                        <DraftViewProvider>
                            <DraftFiltersProvider>
                                <DraftProvider>
                                    <DraftAnalysisProvider>
                                        <ExtraDraftAnalysisProvider>
                                            <DraftSuggestionsProvider>
                                                <BuildProvider>
                                                    <LolClientProvider>
                                                        <App />
                                                        <Toaster
                                                            position="bottom-right"
                                                            toastOptions={{
                                                                duration:
                                                                    Infinity,
                                                            }}
                                                        />
                                                    </LolClientProvider>
                                                </BuildProvider>
                                            </DraftSuggestionsProvider>
                                        </ExtraDraftAnalysisProvider>
                                    </DraftAnalysisProvider>
                                </DraftProvider>
                            </DraftFiltersProvider>
                        </DraftViewProvider>
                    </TooltipProvider>
                </DatasetProvider>
            </UserProvider>
        </PersistQueryClientProvider>
    ),
    document.getElementById("root") as HTMLElement,
);
