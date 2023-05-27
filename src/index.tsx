/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { DraftProvider } from "./context/DraftContext";
import { LolClientProvider } from "./context/LolClientContext";
import { setupAnalytics } from "./utils/analytics";
import { TooltipProvider } from "./context/TooltipContext";
import { Toaster } from "solid-toast";
import { setupMobileVH } from "./utils/mobile";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { BuildProvider } from "./context/BuildContext";
import { DraftViewProvider } from "./context/DraftViewContext";
import { ConfigProvider } from "./context/ConfigContext";
import { DraftSuggestionsProvider } from "./context/DraftSuggestionsContext";
import { DraftAnalysisProvider } from "./context/DraftAnalysisContext";
import { DatasetProvider } from "./context/DatasetContext";

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
                        </DraftViewProvider>
                    </TooltipProvider>
                </DatasetProvider>
            </ConfigProvider>
        </QueryClientProvider>
    ),
    document.getElementById("root") as HTMLElement
);
