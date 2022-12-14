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
                <span class="text-lg uppercase">
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
            <div class="flex items-center mt-2 mb-1 gap-1">
                <span class="text-lg uppercase block">Risk level</span>
                <button
                    onClick={() => {
                        setFAQOpen(true);
                        setTimeout(() => {
                            document
                                .getElementById("faq-risk-level")!
                                .scrollIntoView({
                                    behavior: "smooth",
                                });
                        }, 300);
                    }}
                >
                    <Icon
                        path={questionMarkCircle}
                        class="w-5 inline text-neutral-400 -mt-1"
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
