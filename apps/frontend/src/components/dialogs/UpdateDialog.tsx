import { Component, onMount } from "solid-js";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { useMedia } from "../../hooks/useMedia";
import { createUpdateAvailableToast } from "../../utils/toast";

export const UpdateDialog: Component = () => {
    const { isDesktop } = useMedia();

    onMount(async () => {
        if (!isDesktop) return;

        const update = await check();
        if (!update) return;

        console.log("Update available:", update);
        createUpdateAvailableToast(async () => {
            await update.downloadAndInstall();
            await relaunch();
        });
    });

    return null;
};
