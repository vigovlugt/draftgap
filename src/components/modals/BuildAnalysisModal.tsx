import { Component } from "solid-js";
import Modal from "../common/Modal";
import { useDraft } from "../../context/DraftContext";
import { useBuild } from "../../context/BuildContext";
import { displayNameByRole } from "../../lib/models/Role";
import { BuildSummaryCards } from "../views/builds/BuildSummaryCards";
import { BuildMatchupTable } from "../views/builds/BuildMatchupTable";
import { tooltip } from "../../directives/tooltip";
tooltip;

type Props = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
};

export const BuildAnalysisModal: Component<Props> = (props) => {
    const { dataset } = useDraft();
    const { championKey, championRole, selectedEntity } = useBuild();

    const title = () => {
        const selected = selectedEntity()!;
        switch (selected.type) {
            case "rune":
                if (selected.runeType.startsWith("shard-")) {
                    return dataset()!.statShardData[selected.id].name;
                }
                return dataset()!.runeData[selected.id].name;
            case "item":
                if (
                    selected.itemType === "sets" ||
                    selected.itemType === "startingSets"
                ) {
                    const items = selected.id
                        .split("_")
                        .map((id) => parseInt(id))
                        .reduce((acc, id) => {
                            if (acc[id] !== undefined) {
                                acc[id] += 1;
                            } else {
                                acc[id] = 1;
                            }

                            return acc;
                        }, {} as Record<number, number>);
                    return Object.entries(items)
                        .sort(
                            ([id1], [id2]) =>
                                dataset()!.itemData[parseInt(id2)].gold -
                                dataset()!.itemData[parseInt(id1)].gold
                        )
                        .map(
                            ([id, amount]) =>
                                (amount > 1 ? `${amount} ` : "") +
                                dataset()!.itemData[parseInt(id)].name
                        )
                        .join(" + ");
                }
                return dataset()!.itemData[selected.id as any].name;
        }
    };
    const subTitle = () =>
        dataset()!.championData[championKey()!].name +
        " " +
        displayNameByRole[championRole()!];

    const imageSrc = () => {
        const selected = selectedEntity()!;
        switch (selected.type) {
            case "rune":
                if (selected.runeType.startsWith("shard-")) {
                    const shard = () => dataset()!.statShardData[selected.id];
                    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmods${shard().key.toLocaleLowerCase()}icon${
                        shard().key === "MagicRes" ? ".magicresist_fix" : ""
                    }.png`;
                }
                return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${dataset()!.runeData[
                    selectedEntity()!.id as any
                ].icon.toLowerCase()}`;
            case "item":
                if (
                    selected.itemType === "sets" ||
                    selected.itemType === "startingSets"
                ) {
                    const items = selected.id
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
                }/img/item/${selectedEntity()!.id}.png`;
        }
    };

    const imageAlt = () => {
        const selected = selectedEntity()!;
        switch (selected.type) {
            case "rune":
                if (selected.runeType.startsWith("shard-")) {
                    return dataset()!.statShardData[selected.id].name;
                }
                return dataset()!.runeData[selected.id].name;
            case "item":
                if (
                    selected.itemType === "sets" ||
                    selected.itemType === "startingSets"
                ) {
                    return selected.id
                        .split("_")
                        .map((id) => parseInt(id))
                        .join(" + ");
                }

                return dataset()!.itemData[selected.id as number].name;
        }
    };

    return (
        <Modal
            isOpen={props.isOpen}
            setIsOpen={props.setIsOpen}
            title=""
            titleContainerClass="!h-0 !m-0"
            size="3xl"
        >
            <div class="h-24 bg-[#101010] -m-6 mb-0"></div>
            <div class="flex gap-4 -mt-[48px] items-center">
                <div class="rounded-full border-primary border-8 bg-primary shrink-0">
                    <img
                        src={imageSrc()}
                        class="rounded-full w-20 h-20"
                        alt={imageAlt()}
                        style={{
                            "image-rendering": (() => {
                                const selected = selectedEntity()!;
                                if (
                                    selected.type === "rune" &&
                                    selected.runeType.startsWith("shard")
                                ) {
                                    return "pixelated";
                                }
                                return undefined;
                            })(),
                        }}
                    />
                </div>
                <div class="flex flex-col justify-center w-full min-w-0">
                    <h2 class="text-4xl uppercase mb-1 overflow-hidden whitespace-nowrap text-ellipsis">
                        {title()}
                    </h2>
                    <span class="text-xl text-neutral-300 uppercase mb-[16px]">
                        {subTitle()}
                    </span>
                </div>
            </div>
            <BuildSummaryCards />
            <h3
                class="text-3xl uppercase mt-8 ml-4"
                // @ts-ignore
                use:tooltip={{
                    content: <>Winrates of all {title()} matchups</>,
                    placement: "top",
                }}
            >
                Matchups
            </h3>
            <p
                class="text-neutral-500 uppercase mb-1 ml-4"
                // @ts-ignore
                use:tooltip={{
                    content: (
                        <>
                            The individual champion winrates have been
                            normalized (removed) before calculating the matchup
                            winrates, this to remove the current meta bias of
                            the matchup.
                        </>
                    ),
                    placement: "top",
                }}
            >
                Champion winrates normalized
            </p>
            <BuildMatchupTable class="ring-1 ring-white ring-opacity-10" />
        </Modal>
    );
};
