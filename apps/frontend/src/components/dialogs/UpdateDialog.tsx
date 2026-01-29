import { Component, createSignal, onMount } from "solid-js";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
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
    const [update, setUpdate] = createSignal<Update | null>(null);

    onMount(async () => {
        if (isDesktop) {
            const update = await check();
            if (update) {
                setIsOpen(true);
                console.log("Update available:", update);
                setUpdate(update);
            }
        }
    });

    const doUpdate = async () => {
        setIsOpen(false);
        // display dialog
        await update()?.downloadAndInstall();
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
                    <Button variant="primary" onClick={doUpdate}>
                        Update
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
