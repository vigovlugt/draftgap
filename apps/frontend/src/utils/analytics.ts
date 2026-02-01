declare global {
    interface Window {
        dataLayer: any[];
    }
}

export function setupAnalytics() {
    window.dataLayer = window.dataLayer || [];

    {
        function gtag() {
            // eslint-disable-next-line prefer-rest-params
            window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
    }

    const isProd = import.meta.env.PROD;
    if (!isProd) return;

    const tag = import.meta.env.VITE_GA_TAG;
    if (!tag) {
        console.error("Missing GA tag");
        return;
    }

    gtag("js", new Date());
    gtag("config", tag, {
        app_version: APP_VERSION,
    });

    setInterval(() => {
        if (!document.hasFocus()) return;

        window.gtag("event", "heartbeat", {
            event_category: "heartbeat",
            non_interaction: true,
        });
    }, 1000 * 15);
}
