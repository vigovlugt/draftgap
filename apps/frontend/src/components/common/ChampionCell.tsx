import { Show } from "solid-js";
import { overflowEllipsis } from "../../utils/strings";
import { ChampionIcon } from "../icons/ChampionIcon";
import { useDataset } from "../../contexts/DatasetContext";
import { useUser } from "../../contexts/UserContext";
import { championName } from "../../utils/i18n";

interface Props {
    championKey: string;
    nameMaxLength?: number;
    hideName?: boolean;
}

export default function ChampionCell(props: Props) {
    const { dataset } = useDataset();
    const { config } = useUser();

    const championData = () => dataset()!.championData[props.championKey];
    const name = () => championName(championData(), config);

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
