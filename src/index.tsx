/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { DraftProvider } from "./context/DraftContext";
import { LolClientProvider } from "./context/LolClientContext";

render(
    () => (
        <DraftProvider>
            <LolClientProvider>
                <App />
            </LolClientProvider>
        </DraftProvider>
    ),
    document.getElementById("root") as HTMLElement
);
