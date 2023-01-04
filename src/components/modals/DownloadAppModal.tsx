import {
    Accessor,
    Setter,
    Component,
    createSignal,
    createEffect,
} from "solid-js";
import { Button } from "../common/Button";
import Modal from "../common/Modal";

type Props = {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
};

const AppleLogo = () => {
    return (
        <svg
            viewBox="0 0 170 170"
            fill="currentColor"
            class="w-5 h-5 mr-2 -mt-1"
        >
            <path d="m150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929 0.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002 0.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-0.9 2.61-1.85 5.11-2.86 7.51zm-31.26-123.01c0 8.1021-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-0.119-0.972-0.188-1.995-0.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.3113 11.45-8.597 4.62-2.2516 8.99-3.4968 13.1-3.71 0.12 1.0831 0.17 2.1663 0.17 3.2409z"></path>
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

const Svg = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 750 500"
            class="w-1/2 my-4"
        >
            <path
                fill="#f4f4f4"
                d="M684 19H424v-6H306v6H44a18 18 0 0 0-17 17v357a18 18 0 0 0 17 17h640a18 18 0 0 0 17-17V36a18 18 0 0 0-17-17Z"
            />
            <path d="M498 404H50V50l448 354z" opacity=".1" />
            <path
                fill="#f4f4f4"
                d="M651 93h-30V63h30Zm-29-1h27V64h-27ZM719 397h-61v-4a1 1 0 0 0-1-1h-21a1 1 0 0 0-1 1v4h-13v-4a1 1 0 0 0-1-1h-21a1 1 0 0 0-1 1v4h-13v-4a1 1 0 0 0-1-1h-21a1 1 0 0 0-1 1v4h-13v-4a1 1 0 0 0-1-1h-21a1 1 0 0 0-1 1v4h-13v-4a1 1 0 0 0-1-1h-21a1 1 0 0 0 0 1v4h-14v-4a1 1 0 0 0 0-1h-21a1 1 0 0 0-1 1v4h-13v-4a1 1 0 0 0-1-1H277a1 1 0 0 0-1 1v4h-13v-4a1 1 0 0 0-1-1h-21a1 1 0 0 0 0 1v4h-14v-4a1 1 0 0 0 0-1h-21a1 1 0 0 0-1 1v4h-13v-4a1 1 0 0 0-1-1h-21a1 1 0 0 0-1 1v4h-13v-4a1 1 0 0 0-1-1h-21a1 1 0 0 0-1 1v4h-13v-4a1 1 0 0 0-1-1H98a1 1 0 0 0-1 1v4H84v-4a1 1 0 0 0-1-1H62a1 1 0 0 0-1 1v4H21a21 21 0 0 0-21 21v10a21 21 0 0 0 21 21h698a21 21 0 0 0 21-21v-10a21 21 0 0 0-21-21ZM163 355a76 76 0 1 1 76-76 76 76 0 0 1-76 76Zm0-150a74 74 0 1 0 74 74 74 74 0 0 0-74-74Z"
            />
            <path fill="#101010" d="M50 50h628v354H50z" />
        </svg>
    );
};

const fetchRelease = async () => {
    const response = await fetch(
        "https://api.github.com/repos/vigovlugt/draftgap/releases/latest"
    );
    const json = await response.json();
    return json;
};

export const DownloadAppModal: Component<Props> = ({ isOpen, setIsOpen }) => {
    const [latestRelease, setLatestRelease] = createSignal<any>(null);
    const [isLoading, setIsLoading] = createSignal(false);

    createEffect(() => {
        if (latestRelease() != null) {
            return;
        }
        if (isLoading()) {
            return;
        }
        if (!isOpen()) {
            return;
        }

        setIsLoading(true);
        fetchRelease().then((release) => {
            setLatestRelease(release);
            setIsLoading(false);
        });
    });

    const version = () => latestRelease()?.tag_name.replace("v", "");

    const windowsDownloadUrl = () =>
        latestRelease()?.assets?.find(
            (asset: any) => asset.name === `DraftGap_${version()}_x64_en-US.msi`
        )?.browser_download_url;
    const macDownloadUrl = () =>
        latestRelease()?.assets?.find(
            (asset: any) => asset.name === `DraftGap.app.tar.gz`
        )?.browser_download_url;

    return (
        <Modal
            title="DraftGap desktop app"
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            size="xl"
        >
            <div class="w-full flex justify-center">
                <Svg />
            </div>
            <p class="font-body tracking-normal">
                DraftGap has a desktop app, which enables seamless integration
                with the League client. DraftGap will automatically detect when
                a champion has been picked in the client, and will update the
                draft accordingly. Let DraftGap do the work for you.
            </p>
            <p class="font-body tracking-normal mt-3 text-neutral-400">
                You may get a 'Windows protected your PC' warning, but you can
                safely ignore it by clicking 'More info' and then 'Run anyway'.
            </p>
            <div class="flex justify-between mt-4 gap-6">
                <a
                    href={windowsDownloadUrl()}
                    class="uppercase justify-center text-2xl relative inline-flex items-center border px-4 py-1 font-medium focus:z-10 rounded-md text-neutral-300 border-neutral-700 bg-primary hover:bg-neutral-800 w-full text-center"
                >
                    <WindowsLogo />
                    Download for windows
                </a>
                <a
                    href={macDownloadUrl()}
                    class="uppercase justify-center text-2xl relative inline-flex items-center border px-4 py-1 font-medium focus:z-10 rounded-md text-neutral-300 border-neutral-700 bg-primary hover:bg-neutral-800 w-full text-center"
                >
                    <AppleLogo />
                    Download for mac
                </a>
            </div>
        </Modal>
    );
};
