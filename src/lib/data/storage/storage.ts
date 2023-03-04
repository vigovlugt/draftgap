import { PutBucketCorsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { bytesToHumanReadable } from "../../../utils/bytes";
import { Dataset, getSerializedDataset } from "../../models/Dataset";
import { client } from "./client";

export async function storeDataset(
    dataset: Dataset,
    { name }: { name: string }
) {
    const serialized = getSerializedDataset(dataset);

    const params = {
        Bucket: process.env.S3_BUCKET || "draftgap",
        Key: `datasets/${name}.bin`,
        Body: new Uint8Array(serialized),
    };
    const command = new PutObjectCommand(params);
    await client.send(command);

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
