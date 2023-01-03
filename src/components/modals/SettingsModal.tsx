import { Icon } from "solid-heroicons";
import { questionMarkCircle } from "solid-heroicons/solid-mini";
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
    setFAQOpen: Setter<boolean>;
}

export default function SettingsModal({
    isOpen,
    setIsOpen,
    setFAQOpen,
}: Props) {
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
            <div class="flex items-center mt-2 gap-1">
                <span class="text-2xl uppercase block">Risk level </span>
                <button onClick={() => setFAQOpen(true)}>
                    <Icon
                        path={questionMarkCircle}
                        class="w-5 inline text-neutral-400"
                    />
                </button>
            </div>
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
