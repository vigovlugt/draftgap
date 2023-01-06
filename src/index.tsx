/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { DraftProvider } from "./context/DraftContext";
import { LolClientProvider } from "./context/LolClientContext";
import { setupAnalytics } from "./utils/analytics";
import { TooltipProvider } from "./context/TooltipContext";
import { Toaster } from "solid-toast";

setupAnalytics();

render(
    () => (
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
    ),
    document.getElementById("root") as HTMLElement
);
