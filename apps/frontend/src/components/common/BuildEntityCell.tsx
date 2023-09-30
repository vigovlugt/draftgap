import { Show } from "solid-js";
import { BuildEntity } from "draftgap-core/src/models/build/BuildEntity";
import { overflowEllipsis } from "../../utils/strings";
import { useDataset } from "../../contexts/DatasetContext";

type Props = {
    entity: BuildEntity;
    nameMaxLength?: number;
    hideName?: boolean;
};

export const BuildEntityCell = (props: Props) => {
    const { dataset } = useDataset();

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
            case "summonerSpells": {
                const spells = props.entity.id.split("_");
                return spells
                    .map((id) => dataset()!.summonerSpellData[+id].name)
                    .join(" + ");
            }
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
            case "summonerSpells": {
                const spell =
                    dataset()!.summonerSpellData[
                        +props.entity.id.split("_")[0]
                    ];
                return `https://ddragon.leagueoflegends.com/cdn/${
                    dataset()!.version
                }/img/spell/${spell.id}.png`;
            }
        }
    };

    const imageSrc2 = () => {
        switch (props.entity.type) {
            case "summonerSpells": {
                const spell =
                    dataset()!.summonerSpellData[
                        +props.entity.id.split("_")[1]
                    ];

                return `https://ddragon.leagueoflegends.com/cdn/${
                    dataset()!.version
                }/img/spell/${spell.id}.png`;
            }
        }
    };

    return (
        <div class="flex gap-2">
            <img
                src={imageSrc()}
                alt={name()}
                class="h-[36px] w-36px] rounded"
            />
            <Show when={imageSrc2()}>
                <img
                    src={imageSrc2()!}
                    alt={name()}
                    class="h-[36px] w-36px] rounded"
                />
            </Show>
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
