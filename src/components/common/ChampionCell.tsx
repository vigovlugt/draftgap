import { useDraft } from "../../context/DraftContext";
import { overflowEllipsis } from "../../utils/strings";
import { ChampionIcon } from "../icons/ChampionIcon";

interface Props {
    championKey: string;
    nameMaxLength?: number;
}

export default function ChampionCell(props: Props) {
    const { dataset } = useDraft();

    const name = () => dataset()!.championData[props.championKey].name;

    return (
        <div class="relative">
            <span class="ml-11 uppercase">
                {props.nameMaxLength
                    ? overflowEllipsis(name(), props.nameMaxLength)
                    : name()}
            </span>
            <ChampionIcon
                championKey={props.championKey}
                class="!absolute inset-0"
                size={36}
            />
        </div>
    );
}
