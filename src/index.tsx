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

setupMobileVH();
setupAnalytics();

const queryClient = new QueryClient();

render(
    () => (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <DraftProvider>
                    <LolClientProvider>
                        <App />
                        <Toaster
                            position="bottom-right"
                            toastOptions={{
                                duration: Infinity,
                            }}
                        />
                    </LolClientProvider>
                </DraftProvider>
            </TooltipProvider>
        </QueryClientProvider>
    ),
    document.getElementById("root") as HTMLElement
);
