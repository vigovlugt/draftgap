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
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { BuildProvider } from "./contexts/BuildContext";
import { DraftViewProvider } from "./contexts/DraftViewContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import { DraftSuggestionsProvider } from "./contexts/DraftSuggestionsContext";
import { DraftAnalysisProvider } from "./contexts/DraftAnalysisContext";
import { DatasetProvider } from "./contexts/DatasetContext";
import { DraftFiltersProvider } from "./contexts/DraftFiltersContext";

setupMobileVH();
setupAnalytics();

const queryClient = new QueryClient();

render(
    () => (
        <QueryClientProvider client={queryClient}>
            <ConfigProvider>
                <DatasetProvider>
                    <TooltipProvider>
                        <DraftViewProvider>
                            <DraftFiltersProvider>
                                <DraftProvider>
                                    <DraftAnalysisProvider>
                                        <DraftSuggestionsProvider>
                                            <BuildProvider>
                                                <LolClientProvider>
                                                    <App />
                                                    <Toaster
                                                        position="bottom-right"
                                                        toastOptions={{
                                                            duration: Infinity,
                                                        }}
                                                    />
                                                </LolClientProvider>
                                            </BuildProvider>
                                        </DraftSuggestionsProvider>
                                    </DraftAnalysisProvider>
                                </DraftProvider>
                            </DraftFiltersProvider>
                        </DraftViewProvider>
                    </TooltipProvider>
                </DatasetProvider>
            </ConfigProvider>
        </QueryClientProvider>
    ),
    document.getElementById("root") as HTMLElement
);
