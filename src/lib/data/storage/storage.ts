import {
    PutBucketCorsCommand,
    PutObjectCommand,
    PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { bytesToHumanReadable } from "../../../utils/bytes";
import { Dataset } from "../../models/Dataset";
import { client } from "./client";

export async function storeDataset(
    dataset: Dataset,
    { name }: { name: string }
) {
    //const serialized = getSerializedDataset(dataset);
    // Do this to verify that the serialization is correct
    // const deserialized = getDeserializedDataset(serialized);

    const params = {
        Bucket: process.env.S3_BUCKET || "draftgap",
        Key: `datasets/v2/${name}.json`,
        Body: JSON.stringify(dataset), //new Uint8Array(serialized),
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
