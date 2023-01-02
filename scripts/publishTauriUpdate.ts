import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
import { fetch } from "undici";

export async function main() {
    config();

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
        throw new Error("GITHUB_TOKEN is not set");
    }

    const GIST_TOKEN = process.env.GIST_TOKEN;
    if (!GIST_TOKEN) {
        throw new Error("GIST_TOKEN is not set");
    }

    const GIST_ID = process.env.GIST_ID;
    if (!GIST_ID) {
        throw new Error("GIST_ID is not set");
    }

    const REPOSITORY_NAME = process.env.REPOSITORY_NAME;
    if (!REPOSITORY_NAME) {
        throw new Error("REPOSITORY_NAME is not set");
    }

    const REPOSITORY_OWNER = process.env.REPOSITORY_OWNER;
    if (!REPOSITORY_OWNER) {
        throw new Error("REPOSITORY_OWNER is not set");
    }

    const octokit = new Octokit({
        auth: GITHUB_TOKEN,
    });

    const latestRelease = await octokit.repos.getLatestRelease({
        owner: REPOSITORY_OWNER,
        repo: REPOSITORY_NAME,
    });

    const tagName = latestRelease.data.tag_name;
    const version = tagName.replace("v", "");

    const windowsSignatureUrl = latestRelease.data.assets.find(
        (asset) => asset.name === `DraftGap_${version}_x64_en-US.msi.zip.sig`
    )!.browser_download_url;
    const windowsSignatureResponse = await fetch(windowsSignatureUrl);
    const windowsSignature = await windowsSignatureResponse.text();

    const macSignatureUrl = latestRelease.data.assets.find(
        (asset) => asset.name === `DraftGap.app.tar.gz.sig`
    )!.browser_download_url;
    const macSignatureResponse = await fetch(macSignatureUrl);
    const macSignature = await macSignatureResponse.text();

    const linuxSignatureUrl = latestRelease.data.assets.find(
        (asset) =>
            asset.name === `draft-gap_${version}_amd64.AppImage.tar.gz.sig`
    )!.browser_download_url;
    const linuxSignatureResponse = await fetch(linuxSignatureUrl);
    const linuxSignature = await linuxSignatureResponse.text();

    const tauriUpdaterJson = {
        version: "v" + version,
        platforms: {
            "windows-x86_64": {
                signature: windowsSignature,
                url: `https://github.com/${REPOSITORY_OWNER}/${REPOSITORY_NAME}/releases/download/v${version}/DraftGap_${version}_x64_en-US.msi.zip`,
            },
            "darwin-x86_64": {
                signature: macSignature,
                url: `https://github.com/${REPOSITORY_OWNER}/${REPOSITORY_NAME}/releases/download/v${version}/DraftGap.app.tar.gz.sig`,
            },
            "linux-x86_64": {
                signature: linuxSignature,
                url: `https://github.com/${REPOSITORY_OWNER}/${REPOSITORY_NAME}/releases/download/v${version}/draft-gap_${version}_amd64.AppImage.tar.gz`,
            },
        },
    };

    const json = JSON.stringify(tauriUpdaterJson, null, 4);
    console.log("Updating tauri update json");
    console.log(json);

    const gistOctokit = new Octokit({
        auth: GIST_TOKEN,
    });
    await gistOctokit.gists.update({
        gist_id: GIST_ID,
        files: {
            "draftgap-tauri-update.json": {
                content: json,
            },
        },
    });

    console.log("Updated tauri update json");
}

main();
