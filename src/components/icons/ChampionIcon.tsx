import { JSX, splitProps } from "solid-js";
import { useDataset } from "../../contexts/DatasetContext";

export function ChampionIcon(
    props: {
        championKey: string;
        imgClass?: string;
        size: number;
    } & JSX.HTMLAttributes<HTMLDivElement>
) {
    const [, other] = splitProps(props, ["championKey", "imgClass", "size"]);
    const { dataset } = useDataset();

    return (
        <div
            {...other}
            class={`relative overflow-hidden rounded ${props.class}`}
            style={{
                width: props.size + "px",
                height: props.size + "px",
            }}
        >
            <img
                src={`https://ddragon.leagueoflegends.com/cdn/${
                    dataset()!.version
                }/img/champion/${
                    dataset()!.championData[props.championKey].id
                }.png`}
                loading="lazy"
                class={`absolute ${props.imgClass}`}
                alt={dataset()!.championData[props.championKey].name}
                style={{
                    width: props.size * 1.11 + "px",
                    height: props.size * 1.11 + "px",
                    "max-width": props.size * 1.11 + "px",
                    top: -props.size * 0.055 + "px",
                    left: -props.size * 0.055 + "px",
                }}
            />
        </div>
    );
}
