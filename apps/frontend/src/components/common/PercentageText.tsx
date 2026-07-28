import { Component, Show } from "solid-js";
import { formatPercentage } from "../../utils/rating";
import { Icon } from "solid-heroicons";
import { exclamationTriangle } from "solid-heroicons/solid-mini";
import { tooltip } from "../../directives/tooltip";
// eslint-disable-next-line
tooltip;

type Props = {
    percentage: number;
    games?: number;
};

export const PercentageText: Component<Props> = (props) => {
    return (
        <span
            class="relative"
            style={{
                "font-variant-numeric": "tabular-nums",
            }}
        >
            {formatPercentage(props.percentage / 100)}%
            <Show when={props.games !== undefined && props.games < 1000}>
                <div
                    class="absolute -top-1 -right-6"
                    // @ts-ignore
                    use:tooltip={{
                        content:
                            "This might not be accurate due to the small sample size of " +
                            Math.ceil(props.games!) +
                            " games",
                    }}
                >
                    <Icon
                        path={exclamationTriangle}
                        class="text-yellow-500 w-5 h-5"
                    />
                </div>
            </Show>
        </span>
    );
};
