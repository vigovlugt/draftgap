import { Component, createSignal, onMount } from "solid-js";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { relaunch } from "@tauri-apps/api/process";
import { Button } from "../common/Button";
import { useMedia } from "../../hooks/useMedia";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../common/Dialog";

export const UpdateDialog: Component = () => {
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
        <Dialog open={isOpen()}>
            <DialogContent canClose={false}>
                <DialogHeader>
                    <DialogTitle>Update available!</DialogTitle>
                </DialogHeader>
                <p class="text-xl uppercase text-neutral-300">
                    A new version of DraftGap is available.
                </p>
                <DialogFooter>
                    <Button variant="primary" onClick={update}>
                        Update
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
