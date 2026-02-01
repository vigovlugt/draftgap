import { Show, Switch, Match, createEffect } from "solid-js";
import { createQuery } from "@tanstack/solid-query";
import { LoadingIcon } from "../icons/LoadingIcon";
import { buttonVariants } from "../common/Button";
import { DialogContent, DialogHeader, DialogTitle } from "../common/Dialog";
import { cn } from "../../utils/style";
import { Octokit } from "@octokit/rest";

const AppleLogo = () => {
    return (
        <svg
            viewBox="0 0 170 170"
            fill="currentColor"
            class="w-5 h-5 mr-2 -mt-[2px]"
        >
            <path d="m150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929 0.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002 0.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-0.9 2.61-1.85 5.11-2.86 7.51zm-31.26-123.01c0 8.1021-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-0.119-0.972-0.188-1.995-0.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.3113 11.45-8.597 4.62-2.2516 8.99-3.4968 13.1-3.71 0.12 1.0831 0.17 2.1663 0.17 3.2409z" />
        </svg>
    );
};

const WindowsLogo = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2500 2500"
            fill="currentColor"
            class="w-4 h-4 mr-2"
        >
            <path d="M1187.9 1187.9H0V0h1187.9zM2499.6 1187.9h-1188V0h1187.9v1187.9zM1187.9 2500H0V1312.1h1187.9zM2499.6 2500h-1188V1312.1h1187.9V2500z" />
        </svg>
    );
};

type Props = {
    open: boolean;
};

export function DesktopAppDialog(props: Props) {
    const releaseQuery = createQuery(() => ({
        queryKey: ["latest-release"],
        enabled: props.open,
        queryFn: async () => {
            const octokit = new Octokit();
            const response = await octokit.rest.repos.getLatestRelease({ owner: "vigovlugt", repo: "draftgap" });

            const macAsset = response.data.assets.find((a) => a.name.endsWith("aarch64.dmg"));
            const windowsAsset = response.data.assets.find((a) => a.name.endsWith("x64_en-US.msi"));

            return {
                macUrl: macAsset?.browser_download_url,
                windowsUrl: windowsAsset?.browser_download_url,
            };
        },
    }));
    createEffect(() => {
        console.log(props.open);
    });

     
    const nav = navigator as any;
    const isMac =
        (nav?.userAgentData?.platform || navigator?.platform || "unknown")
            .toUpperCase()
            .indexOf("MAC") >= 0;

    return (
        <DialogContent class="max-w-xl">
            <DialogHeader>
                <DialogTitle>DraftGap desktop app</DialogTitle>
            </DialogHeader>
            <p class="font-body">
                DraftGap has a desktop app, which enables seamless integration
                with the League client. DraftGap will automatically detect when
                a champion has been picked in champion select, and will update
                the draft accordingly. Let DraftGap do the work for you.
            </p>

            <Switch>
                <Match when={releaseQuery.data && !releaseQuery.error}>
                    <Show
                        when={!isMac}
                        fallback={
                            <p class="font-body text-neutral-400 text-sm">
                                You may get a 'macOS cannot verify that this app is free
                                from malware' warning, but you can safely ignore it
                                (check{" "}
                                <a
                                    href={
                                        "https://www.virustotal.com/gui/search/" +
                                        encodeURI(
                                            encodeURIComponent(
                                                releaseQuery.data?.macUrl ?? ""
                                            )
                                        )
                                    }
                                    class="text-blue-500"
                                    target="_blank"
                                >
                                    VirusTotal
                                </a>
                                ) by using command+click in finder on the app and
                                clicking 'Open' and then 'Open' again.
                            </p>
                        }
                    >
                        <p class="font-body text-neutral-400 text-sm">
                            You may get a 'Windows protected your PC' warning, but you
                            can safely ignore it (check{" "}
                            <a
                                href={
                                    "https://www.virustotal.com/gui/search/" +
                                    encodeURI(
                                        encodeURIComponent(
                                            releaseQuery.data?.windowsUrl ?? ""
                                        )
                                    )
                                }
                                class="text-blue-500"
                                target="_blank"
                            >
                                VirusTotal
                            </a>
                            ) by clicking 'More info' and then 'Run anyway'.
                        </p>
                    </Show>

                    <div
                        class="flex justify-between gap-6"
                        classList={{
                            "flex-row-reverse": isMac,
                        }}
                    >
                        <Show when={releaseQuery.data?.windowsUrl}>
                            <a
                                href={releaseQuery.data!.windowsUrl}
                                class={cn(
                                    buttonVariants({
                                        variant: !isMac ? "primary" : "secondary",
                                    }),
                                    "w-full text-lg flex justify-center",
                                    {
                                        "border-neutral-700 text-neutral-300": isMac,
                                    }
                                )}
                            >
                                <WindowsLogo />
                                Download for windows
                            </a>
                        </Show>
                        <Show when={releaseQuery.data?.macUrl}>
                            <a
                                href={releaseQuery.data!.macUrl}
                                class={cn(
                                    buttonVariants({
                                        variant: isMac ? "primary" : "secondary",
                                    }),
                                    "w-full text-lg flex justify-center",
                                    {
                                        "border-neutral-700 text-neutral-300": !isMac,
                                    }
                                )}
                            >
                                <AppleLogo />
                                Download for mac
                            </a>
                        </Show>
                    </div>
                </Match>

                <Match when={releaseQuery.isLoading}>
                    <div class="flex justify-center">
                        <LoadingIcon class="animate-spin h-6 w-6" />
                    </div>
                </Match>

                <Match when={releaseQuery.error}>
                    <p class="font-body text-neutral-400 text-sm">
                        Failed to load download links. Please visit{" "}
                        <a
                            href="https://github.com/vigovlugt/draftgap/releases/latest"
                            class="text-blue-500"
                            target="_blank"
                        >
                            GitHub releases
                        </a>{" "}
                        to download the desktop app.
                    </p>
                </Match>
            </Switch>
        </DialogContent>
    );
}
