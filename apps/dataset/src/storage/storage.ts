import {
    GetObjectCommand,
    type GetObjectCommandInput,
    PutBucketCorsCommand,
    PutObjectCommand,
    type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
    DATASET_VERSION,
    type Dataset,
} from "@draftgap/core/src/models/dataset/Dataset";
import { bytesToHumanReadable } from "../utils";

// The frontend serves the datasets from its public directory
const LOCAL_DATASET_DIR = fileURLToPath(
    new URL("../../../frontend/public", import.meta.url),
);

function getDatasetKey(name: string) {
    return `datasets/v${DATASET_VERSION}/${name}.json`;
}

export async function getDataset({ name }: { name: string }) {
    const { client } = await import("./client");
    const params = {
        Bucket: process.env.S3_BUCKET || "draftgap",
        Key: getDatasetKey(name),
    } satisfies GetObjectCommandInput;
    const command = new GetObjectCommand(params);
    const response = await client.send(command);
    const body = await response.Body?.transformToString()!;
    return JSON.parse(body) as Dataset;
}

export async function storeDataset(
    dataset: Dataset,
    { name }: { name: string },
) {
    const key = getDatasetKey(name);
    const body = JSON.stringify(dataset);

    const file = path.join(LOCAL_DATASET_DIR, key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
    console.log(
        `Stored dataset ${file} of size ${bytesToHumanReadable(body.length)}`,
    );

    // Uploading to S3 is optional, set VITE_DATASET_URL in the frontend to use it
    if (!process.env.S3_ENDPOINT) {
        return;
    }

    const { client } = await import("./client");
    const params = {
        Bucket: process.env.S3_BUCKET || "draftgap",
        Key: key,
        Body: body,
        ContentType: "application/json",
    } satisfies PutObjectCommandInput;
    const command = new PutObjectCommand(params);
    await client.send(command);
    console.log(`Uploaded dataset ${params.Bucket}/${params.Key}`);

    const corsCommand = new PutBucketCorsCommand({
        Bucket: process.env.S3_BUCKET || "draftgap",
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedHeaders: ["*"],
                    AllowedMethods: ["GET"],
                    AllowedOrigins: ["*"],
                    MaxAgeSeconds: 3000,
                },
            ],
        },
    });

    await client.send(corsCommand);
}
