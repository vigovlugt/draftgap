import { Component, createSignal, onMount } from "solid-js";
import Modal from "../common/Modal";
import {
    checkUpdate,
    installUpdate,
    UpdateResult,
} from "@tauri-apps/api/updater";
import { relaunch } from "@tauri-apps/api/process";
import { Button } from "../common/Button";
import { useDraft } from "../../context/DraftContext";

export const UpdateModal: Component = () => {
    const { isDesktop } = useDraft();
    const [isOpen, setIsOpen] = createSignal(false);
    const [updateResult, setUpdateResult] = createSignal<UpdateResult>();

    onMount(() => {
        if (isDesktop) {
            (async () => {
                const update = await checkUpdate();
                setUpdateResult(update);
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
        <Modal title="Update available!" isOpen={isOpen} setIsOpen={setIsOpen}>
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
