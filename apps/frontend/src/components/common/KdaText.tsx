import { Component } from "solid-js";

type Props = {
    kills: number;
    deaths: number;
    assists: number;
};

export const KdaText: Component<Props> = (props) => {
    const ratio = () =>
        props.deaths === 0
            ? props.kills + props.assists
            : (props.kills + props.assists) / props.deaths;

    return (
        <span
            class="relative"
            style={{
                "font-variant-numeric": "tabular-nums",
            }}
        >
            {props.kills.toFixed(1)} / {props.deaths.toFixed(1)} /{" "}
            {props.assists.toFixed(1)}
            <span class="text-neutral-400 ml-1">
                ({ratio().toFixed(2)})
            </span>
        </span>
    );
};
