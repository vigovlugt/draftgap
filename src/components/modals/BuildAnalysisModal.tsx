import { Component } from "solid-js";
import Modal from "../common/Modal";
import { useDraft } from "../../context/DraftContext";
import { useBuild } from "../../context/BuildContext";
import { displayNameByRole } from "../../lib/models/Role";
import { BuildSummaryCards } from "../views/builds/BuildSummaryCards";

type Props = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
};

export const BuildAnalysisModal: Component<Props> = (props) => {
    const { dataset } = useDraft();
    const { championKey, championRole, selectedEntity } = useBuild();

    const title = () =>
        ({
            rune: dataset()!.runeData[selectedEntity()!.id].name,
        }[selectedEntity()!.type]);
    const subTitle = () =>
        dataset()!.championData[championKey()!].name +
        " " +
        displayNameByRole[championRole()!];

    const imageSrc = () =>
        ({
            rune: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${dataset()!.runeData[
                selectedEntity()!.id
            ].icon.toLowerCase()}`,
        }[selectedEntity()!.type]);
    const imageAlt = () =>
        ({
            rune: dataset()!.runeData[selectedEntity()!.id].name,
        }[selectedEntity()!.type]);

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
                <div class="rounded-full border-primary border-8 bg-primary">
                    <img
                        src={imageSrc()}
                        class="rounded-full w-20 h-20"
                        alt={imageAlt()}
                    />
                </div>
                <div class="flex flex-col justify-center">
                    <h2 class="text-4xl uppercase mb-1">{title()}</h2>
                    <span class="text-xl text-neutral-300 uppercase mb-[16px]">
                        {subTitle()}
                    </span>
                </div>
            </div>
            <BuildSummaryCards />
        </Modal>
    );
};
