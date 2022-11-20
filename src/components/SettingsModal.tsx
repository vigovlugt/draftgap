import { Accessor, Setter } from "solid-js";
import { useDraft } from "../context/DraftContext";
import { Button } from "./common/Button";
import Modal from "./common/Modal";
import { Toggle } from "./common/Toggle";

interface Props {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
}

export default function SettingsModal({ isOpen, setIsOpen }: Props) {
    const { config, setConfig } = useDraft();

    const close = () => setIsOpen(false);
    return (
        <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Settings">
            <div class="flex space-x-16 items-center justify-between">
                <span class="text-2xl uppercase">
                    Ignore indivdual champion winrates
                </span>
                <Toggle
                    isChecked={() => config.ignoreChampionWinrates}
                    onChange={() =>
                        setConfig(
                            "ignoreChampionWinrates",
                            !config.ignoreChampionWinrates
                        )
                    }
                />
            </div>
        </Modal>
    );
}
