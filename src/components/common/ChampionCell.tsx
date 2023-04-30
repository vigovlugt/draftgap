import { Show } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { overflowEllipsis } from "../../utils/strings";
import { ChampionIcon } from "../icons/ChampionIcon";

interface Props {
    championKey: string;
    nameMaxLength?: number;
    hideName?: boolean;
}

export default function ChampionCell(props: Props) {
    const { dataset } = useDraft();

    const name = () => dataset()!.championData[props.championKey].name;

    return (
        <div class="flex gap-2">
            <ChampionIcon championKey={props.championKey} size={36} />
            <Show when={!props.hideName}>
                <span class="uppercase">
                    {props.nameMaxLength
                        ? overflowEllipsis(name(), props.nameMaxLength)
                        : name()}
                </span>
            </Show>
        </div>
    );
}
