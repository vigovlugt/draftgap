import {
    GetObjectCommand,
    GetObjectCommandInput,
    PutBucketCorsCommand,
    PutObjectCommand,
    PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { client } from "./client";
import {
    DATASET_VERSION,
    Dataset,
} from "@draftgap/core/src/models/dataset/Dataset";
import { bytesToHumanReadable } from "../utils";

export async function getDataset({ name }: { name: string }) {
    const params = {
        Bucket: process.env.S3_BUCKET || "draftgap",
        Key: `datasets/v${DATASET_VERSION}/${name}.json`,
    } satisfies GetObjectCommandInput;
    const command = new GetObjectCommand(params);
    const response = await client.send(command);
    const body = await response.Body?.transformToString()!;
    return JSON.parse(body) as Dataset;
}

export async function storeDataset(
    dataset: Dataset,
    { name }: { name: string }
) {
    const params = {
        Bucket: process.env.S3_BUCKET || "draftgap",
        Key: `datasets/v${DATASET_VERSION}/${name}.json`,
        Body: JSON.stringify(dataset),
        ContentType: "application/json",
    } satisfies PutObjectCommandInput;
    const command = new PutObjectCommand(params);
    await client.send(command);

    const serialized = {
        byteLength: params.Body.length,
    };
    console.log(
        `Stored dataset ${params.Bucket}/${
            params.Key
        } of size ${bytesToHumanReadable(serialized.byteLength)}`
    );

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
