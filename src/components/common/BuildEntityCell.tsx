import { Show } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { BuildEntityType } from "../../lib/models/build/BuildEntity";
import { overflowEllipsis } from "../../utils/strings";

type Props = {
    entityType: BuildEntityType;
    entityId: number | string;
    nameMaxLength?: number;
    hideName?: boolean;
};

export const BuildEntityCell = (props: Props) => {
    const { dataset } = useDraft();

    const name = () => {
        switch (props.entityType) {
            case "rune":
                return dataset()!.runeData[props.entityId as number].name;
            case "item":
                if (typeof props.entityId === "string") {
                    return "Item set";
                }
                return dataset()!.itemData[props.entityId].name;
        }
    };

    const imageSrc = () => {
        switch (props.entityType) {
            case "rune":
                return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${dataset()!.runeData[
                    props.entityId as number
                ].icon.toLowerCase()}`;
            case "item":
                return `https://ddragon.leagueoflegends.com/cdn/${
                    dataset()!.version
                }/img/item/${props.entityId}.png`;
        }
    };

    return (
        <div class="flex gap-2">
            <img
                src={imageSrc()}
                alt={name()}
                class="h-[36px] w-36px] rounded"
            />
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
