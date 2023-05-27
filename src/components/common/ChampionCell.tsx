import { Show } from "solid-js";
import { overflowEllipsis } from "../../utils/strings";
import { ChampionIcon } from "../icons/ChampionIcon";
import { useDataset } from "../../context/DatasetContext";

interface Props {
    championKey: string;
    nameMaxLength?: number;
    hideName?: boolean;
}

export default function ChampionCell(props: Props) {
    const { dataset } = useDataset();

    const name = () => dataset()!.championData[props.championKey].name;

    return (
        <div class="flex gap-2">
            <ChampionIcon championKey={props.championKey} size={36} />
            <Show when={!props.hideName}>
                <span class="uppercase truncate">
                    {props.nameMaxLength
                        ? overflowEllipsis(name(), props.nameMaxLength)
                        : name()}
                </span>
            </Show>
        </div>
    );
}
