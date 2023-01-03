import { JSX } from "solid-js";
import { useDraft } from "../../context/DraftContext";

export function ChampionIcon({
    championKey,
    ...props
}: { championKey: string } & JSX.HTMLAttributes<HTMLDivElement>) {
    const { dataset } = useDraft();

    return (
        <div
            {...props}
            class={`${props.class} overflow-hidden h-9 w-9 rounded`}
        >
            <img
                src={`https://ddragon.leagueoflegends.com/cdn/${
                    dataset()!.version
                }/img/champion/${dataset()!.championData[championKey].id}.png`}
                loading="lazy"
                class="scale-110 h-9 w-9"
                alt={dataset()!.championData[championKey].name}
            ></img>
        </div>
    );
}
