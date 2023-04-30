import { Show } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { BuildEntityType } from "../../lib/models/build/BuildEntity";
import { overflowEllipsis } from "../../utils/strings";

type Props = {
    entityType: BuildEntityType;
    entityId: number;
    nameMaxLength?: number;
    hideName?: boolean;
};

export const BuildEntityCell = (props: Props) => {
    const { dataset } = useDraft();

    const name = () =>
        ({
            rune: dataset()!.runeData[props.entityId].name,
        }[props.entityType]);

    const imageSrc = () =>
        ({
            rune: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${dataset()!.runeData[
                props.entityId
            ].icon.toLowerCase()}`,
        }[props.entityType]);

    return (
        <div class="flex gap-2">
            <img src={imageSrc()} alt={name()} class="h-[36px] w-36px]" />
            <Show when={!props.hideName}>
                <span class="uppercase">
                    {props.nameMaxLength
                        ? overflowEllipsis(name(), props.nameMaxLength)
                        : name()}
                </span>
            </Show>
        </div>
    );
};
