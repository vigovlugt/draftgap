import { Component, createSignal, onMount } from "solid-js";
import Modal from "../common/Modal";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { relaunch } from "@tauri-apps/api/process";
import { Button } from "../common/Button";
import { useMedia } from "../../hooks/useMedia";

export const UpdateModal: Component = () => {
    const { isDesktop } = useMedia();
    const [isOpen, setIsOpen] = createSignal(false);

    onMount(() => {
        if (isDesktop) {
            (async () => {
                const update = await checkUpdate();
                if (update.shouldUpdate) {
                    setIsOpen(true);
                    console.log("Update available, manifest:", update.manifest);
                }
            })();
        }
    });

    const update = async () => {
        setIsOpen(false);
        // display dialog
        await installUpdate();
        // install complete, restart the app
        await relaunch();
    };

    return (
        <Modal
            title="Update available!"
            isOpen={isOpen()}
            setIsOpen={setIsOpen}
        >
            <p class="text-2xl">
                A new version of DraftGap is available. Do you want to update?
            </p>
            <div class="flex justify-end mt-2">
                <Button theme="primary" onClick={update}>
                    Update
                </Button>
            </div>
        </Modal>
    );
};
