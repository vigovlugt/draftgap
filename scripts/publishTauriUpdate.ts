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

    const latestJson = await octokit.repos.getReleaseAsset({
        owner: REPOSITORY_OWNER,
        repo: REPOSITORY_NAME,
        asset_id: latestRelease.data.assets.find(
            (a) => a.name === "latest.json"
        )!.id,
        headers: {
            Accept: "application/octet-stream",
        },
    });

    const latestJsonString = new TextDecoder().decode(
        latestJson.data as unknown as ArrayBuffer
    );

    const gistOctokit = new Octokit({
        auth: GIST_TOKEN,
    });
    await gistOctokit.gists.update({
        gist_id: GIST_ID,
        files: {
            "draftgap-tauri-update.json": {
                content: latestJsonString,
            },
        },
    });

    console.log("Updated tauri update json");
}

main();
