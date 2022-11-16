/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { DraftProvider } from "./context/DraftContext";

render(
    () => (
        <DraftProvider>
            <App />
        </DraftProvider>
    ),
    document.getElementById("root") as HTMLElement
);
