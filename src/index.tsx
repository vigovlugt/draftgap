/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { DraftProvider } from "./context/DraftContext";
import { LolClientProvider } from "./context/LolClientContext";

function setupAnalytics() {
    const isProd = import.meta.env.PROD;
    if (!isProd) return;

    const tag = import.meta.env.VITE_GA_TAG;
    if (!tag) {
        console.error("Missing GA tag");
        return;
    }

    (window as any).dataLayer = (window as any).dataLayer || [];
    const dataLayer = (window as any).dataLayer;
    function gtag(...args: any[]) {
        (dataLayer as any).push(arguments);
    }
    gtag("js", new Date());
    gtag("config", tag);
}

setupAnalytics();

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
