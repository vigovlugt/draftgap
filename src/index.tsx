/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { DraftProvider } from "./context/DraftContext";
import { LolClientProvider } from "./context/LolClientContext";
import { setupAnalytics } from "./utils/analytics";
import { TooltipProvider } from "./context/TooltipContext";

setupAnalytics();

render(
    () => (
        <TooltipProvider>
            <DraftProvider>
                <LolClientProvider>
                    <App />
                </LolClientProvider>
            </DraftProvider>
        </TooltipProvider>
    ),
    document.getElementById("root") as HTMLElement
);
