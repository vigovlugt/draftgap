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
        if (!chart()) {
            const chart = new ChartJs(canvas()!, {
                ...props.chart,
                options: {
                    ...props.chart.options,
                    maintainAspectRatio: false,
                    plugins: {
                        ...props.chart.options?.plugins,

                        tooltip: {
                            ...props.chart.options?.plugins?.tooltip,
                            displayColors: false,
                        },
                    },
                } as ChartOptions<T>,
            });
            setChart(chart);
        }

        chart()?.update();
    });

    onCleanup(() => {
        chart()?.destroy();
    });

    return <canvas ref={setCanvas} />;
}
