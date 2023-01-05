import { Icon } from "solid-heroicons";
import { arrowLeft, arrowRight } from "solid-heroicons/solid-mini";
import { Show } from "solid-js";
import { formatPercentage } from "../../utils/rating";

interface Props {
    winner: boolean;
    winrate?: number;
}

export function WinnerCell({ winner, winrate }: Props) {
    return (
        <div class="flex justify-center items-center w-full relative">
            <Icon
                path={winner ? arrowLeft : arrowRight}
                class="absolute w-6"
                classList={{
                    "text-ally": winner,
                    "text-opponent": !winner,
                    "bottom-0": winrate !== undefined,
                }}
            />
            <Show when={winrate}>
                <span class="-bottom-7 absolute text-base text-neutral-500">
                    {formatPercentage(winrate!)}
                </span>
            </Show>
        </div>
    );
}
