import { PutBucketCorsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Dataset, getSerializedDataset } from "../../models/Dataset";
import { client } from "./client";

export async function storeDataset(dataset: Dataset) {
    const serialized = getSerializedDataset(dataset);

    const params = {
        Bucket: process.env.S3_BUCKET || "draftgap",
        Key: `datasets/${dataset.version}.bin`,
        Body: new Uint8Array(serialized),
    };
    const command = new PutObjectCommand(params);
    await client.send(command);

    console.log(`Stored dataset ${params.Bucket}/${params.Key}`);

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
