import {
    ChartConfiguration,
    Chart as ChartJs,
    ChartOptions,
    ChartTypeRegistry,
} from "chart.js/auto";
import { createEffect, createSignal, onCleanup } from "solid-js";

type Props<T extends keyof ChartTypeRegistry> = {
    chart: ChartConfiguration<T>;
};

ChartJs.defaults.backgroundColor = "#00ff00";
ChartJs.defaults.borderColor = "#404040";
ChartJs.defaults.color = "#fff";
ChartJs.defaults.font.family = "Oswald, sans-serif";
ChartJs.defaults.font.size = 16;

export function Chart<T extends keyof ChartTypeRegistry>(props: Props<T>) {
    const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
    const [chart, setChart] = createSignal<ChartJs<T>>();

    createEffect(() => {
        if (!canvas()) return;

        const config = {
            ...props.chart,
            options: {
                ...props.chart.options,
                maintainAspectRatio: false,
                plugins: {
                    // @ts-ignore
                    ...props.chart.options?.plugins,

                    tooltip: {
                        backgroundColor: "#444444",
                        displayColors: false,
                        // @ts-ignore
                        ...props.chart.options?.plugins?.tooltip,
                    },
                },
            } as ChartOptions<T>,
        };

        setChart((current) => {
            current?.destroy();
            return new ChartJs(canvas()!, config);
        });
    });

    onCleanup(() => {
        chart()?.destroy();
    });

    return <canvas ref={setCanvas} />;
}
