/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { DraftProvider } from "./context/DraftContext";
import { LolClientProvider } from "./context/LolClientContext";

function setupAnalytics() {
    const isProd = import.meta.env.PROD;
    if (!isProd) return;

    const desktopTag = import.meta.env.VITE_GA_DESKTOP;
    if (!desktopTag) {
        throw new Error("Missing GA desktop tag");
    }
    const webTag = import.meta.env.VITE_GA_WEB;
    if (!desktopTag) {
        throw new Error("Missing GA web tag");
    }

    const isDesktop = (window as any).__TAURI__;

    (window as any).dataLayer = (window as any).dataLayer || [];
    const dataLayer = (window as any).dataLayer;
    function gtag(...args: any[]) {
        (dataLayer as any).push(arguments);
    }
    gtag("js", new Date());
    gtag("config", isDesktop ? desktopTag : webTag);
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
