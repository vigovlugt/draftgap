import { useDraft } from "../../context/DraftContext";
import { ChampionIcon } from "../icons/ChampionIcon";

interface Props {
    championKey: string;
}

export default function ChampionCell({ championKey }: Props) {
    const { dataset } = useDraft();

    return (
        <div class="relative">
            <span class="ml-11 uppercase">
                {dataset()!.championData[championKey].name}
            </span>
            <ChampionIcon championKey={championKey} class="absolute inset-0" />
        </div>
    );
}
