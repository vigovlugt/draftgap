import { Show } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { BuildEntity } from "../../lib/models/build/BuildEntity";
import { overflowEllipsis } from "../../utils/strings";

type Props = {
    entity: BuildEntity;
    nameMaxLength?: number;
    hideName?: boolean;
};

export const BuildEntityCell = (props: Props) => {
    const { dataset } = useDraft();

    const name = () => {
        switch (props.entity.type) {
            case "rune":
                if (props.entity.runeType.startsWith("shard-")) {
                    return dataset()!.statShardData[props.entity.id].name;
                }
                return dataset()!.runeData[props.entity.id].name;
            case "item":
                if (
                    props.entity.itemType === "sets" ||
                    props.entity.itemType === "startingSets"
                ) {
                    return "Item set";
                }

                return dataset()!.itemData[props.entity.id as number].name;
        }
    };

    const imageSrc = () => {
        switch (props.entity.type) {
            case "rune":
                if (props.entity.runeType.startsWith("shard-")) {
                    const shard = dataset()!.statShardData[props.entity.id];
                    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmods${shard.key.toLocaleLowerCase()}icon${
                        shard.key === "MagicRes" ? ".magicresist_fix" : ""
                    }.png`;
                }
                return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${dataset()!.runeData[
                    props.entity.id as number
                ].icon.toLowerCase()}`;
            case "item":
                if (
                    props.entity.itemType === "sets" ||
                    props.entity.itemType === "startingSets"
                ) {
                    const items = props.entity.id
                        .split("_")
                        .map((id) => parseInt(id))
                        .sort(
                            (a, b) =>
                                dataset()!.itemData[b].gold -
                                dataset()!.itemData[a].gold
                        );

                    return `https://ddragon.leagueoflegends.com/cdn/${
                        dataset()!.version
                    }/img/item/${items[0]}.png`;
                }

                return `https://ddragon.leagueoflegends.com/cdn/${
                    dataset()!.version
                }/img/item/${props.entity.id}.png`;
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
