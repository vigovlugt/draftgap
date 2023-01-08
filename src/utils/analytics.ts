export function gtag(...args: any[]) {
    (window as any).dataLayer.push(arguments);
}
window.gtag = gtag;

export function setupAnalytics() {
    const isProd = import.meta.env.PROD;
    if (!isProd) return;

    const tag = import.meta.env.VITE_GA_TAG;
    if (!tag) {
        console.error("Missing GA tag");
        return;
    }

    (window as any).dataLayer = (window as any).dataLayer || [];
    gtag("js", new Date());
    gtag("config", tag);

    setInterval(() => {
        gtag("event", "heartbeat", {
            event_category: "heartbeat",
            non_interaction: true,
        });
    }, 1000 * 15);
}
