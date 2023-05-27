import { Icon } from "solid-heroicons";
import { arrowLeft, arrowRight } from "solid-heroicons/solid-mini";
import { Show } from "solid-js";
import { formatPercentage } from "../../utils/rating";

interface Props {
    winner: boolean;
    winrate?: number;
}

export function WinnerCell(props: Props) {
    return (
        <div class="flex justify-center items-center w-full relative">
            <Icon
                path={props.winner ? arrowLeft : arrowRight}
                class="absolute w-6"
                classList={{
                    "text-ally": props.winner,
                    "text-opponent": !props.winner,
                    "bottom-0": props.winrate !== undefined,
                }}
            />
            <Show when={props.winrate}>
                <span class="-bottom-7 absolute text-base text-neutral-500">
                    {formatPercentage(props.winrate!)}
                </span>
            </Show>
        </div>
    );
}
