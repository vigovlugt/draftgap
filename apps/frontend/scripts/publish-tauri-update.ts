import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
import {
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
config();

const errors: string[] = [];

const [
    GITHUB_TOKEN,
    REPOSITORY_NAME,
    REPOSITORY_OWNER,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_ENDPOINT,
] = (
    [
        "GITHUB_TOKEN",
        "REPOSITORY_NAME",
        "REPOSITORY_OWNER",
        "S3_ACCESS_KEY_ID",
        "S3_SECRET_ACCESS_KEY",
        "S3_ENDPOINT",
    ] as const
).map((v) => {
    const value = process.env[v];
    if (!value) {
        errors.push(`${v} is not set`);
    }
    return value ?? "";
});

const S3_BUCKET = process.env.S3_BUCKET || "draftgap";

if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(1);
}

const octokit = new Octokit({
    auth: GITHUB_TOKEN,
});

// Api token is stored in the environment variable
export const client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: process.env.S3_REGION || "auto",
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
});

export async function main() {
    const latestRelease = await octokit.repos.getLatestRelease({
        owner: REPOSITORY_OWNER,
        repo: REPOSITORY_NAME,
    });

    const latestJsonBinary = await octokit.repos.getReleaseAsset({
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
        latestJsonBinary.data as unknown as ArrayBuffer
    );

    const latestJson = JSON.parse(latestJsonString);

    console.log(`Storing latest.json in S3`);
    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: `releases/latest.json`,
        Body: JSON.stringify(latestJson, null, 4),
        ContentType: "application/json",
    });
    await client.send(command);

    console.log("Updated tauri updater latest.json");
}
