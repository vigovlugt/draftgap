import { JSX } from "solid-js";
import { useDraft } from "../../context/DraftContext";

export function ChampionIcon(
    props: {
        championKey: string;
        imgClass?: string;
    } & JSX.HTMLAttributes<HTMLDivElement>
) {
    const { dataset } = useDraft();

    return (
        <div
            {...props}
            class={`overflow-hidden h-9 w-9 rounded ${props.class}`}
        >
            <img
                src={`https://ddragon.leagueoflegends.com/cdn/${
                    dataset()!.version
                }/img/champion/${
                    dataset()!.championData[props.championKey].id
                }.png`}
                loading="lazy"
                class={`scale-110 h-9 w-9 ${props.imgClass}`}
                alt={dataset()!.championData[props.championKey].name}
            ></img>
        </div>
    );
}
