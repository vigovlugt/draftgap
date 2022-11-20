/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { DraftProvider } from "./context/DraftContext";
import { DragDropProvider, DragDropSensors } from "@thisbeyond/solid-dnd";

render(
    () => (
        <DraftProvider>
            <DragDropProvider>
                <DragDropSensors>
                    <App />
                </DragDropSensors>
            </DragDropProvider>
        </DraftProvider>
    ),
    document.getElementById("root") as HTMLElement
);
