/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { DraftProvider } from "./context/DraftContext";
import { DragDropProvider, DragDropSensors } from "@thisbeyond/solid-dnd";
import { LolClientProvider } from "./context/LolClientContext";

render(
    () => (
        <DraftProvider>
            <LolClientProvider>
                <DragDropProvider>
                    <DragDropSensors>
                        <App />
                    </DragDropSensors>
                </DragDropProvider>
            </LolClientProvider>
        </DraftProvider>
    ),
    document.getElementById("root") as HTMLElement
);
