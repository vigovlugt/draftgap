import { Accessor, Setter } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import {
    displayNameByRiskLevel,
    RiskLevel,
} from "../../lib/suggestions/suggestions";
import { ButtonGroup, ButtonGroupOption } from "../common/ButtonGroup";
import Modal from "../common/Modal";
import { Toggle } from "../common/Toggle";

interface Props {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
}

export default function SettingsModal({ isOpen, setIsOpen }: Props) {
    const { config, setConfig } = useDraft();

    const riskLevelOptions: ButtonGroupOption<RiskLevel>[] = RiskLevel.map(
        (level) => ({
            value: level,
            label: displayNameByRiskLevel[level],
        })
    );

    return (
        <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Settings">
            <div class="flex space-x-16 items-center justify-between">
                <span class="text-2xl uppercase">
                    Ignore indivdual champion winrates
                </span>
                <Toggle
                    isChecked={() => config().ignoreChampionWinrates}
                    onChange={() =>
                        setConfig({
                            ...config(),
                            ignoreChampionWinrates:
                                !config().ignoreChampionWinrates,
                        })
                    }
                />
            </div>
            <span class="text-2xl uppercase mt-2 block">Risk level</span>
            <ButtonGroup
                options={riskLevelOptions}
                selected={() => config().riskLevel}
                onChange={(value: RiskLevel) => {
                    setConfig({
                        ...config(),
                        riskLevel: value,
                    });
                }}
            />
        </Modal>
    );
}
