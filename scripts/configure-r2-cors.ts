
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
});

console.log("Starting CORS configuration...");

async function configureCors() {
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  if (!bucketName) {
    console.error("Bucket name is not defined in environment variables.");
    return;
  }

  console.log(`Configuring CORS for bucket: ${bucketName}`);

  const command = new PutBucketCorsCommand({
    Bucket: bucketName,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["PUT", "POST", "GET", "DELETE", "HEAD"],
          AllowedOrigins: ["*"], // Allow all origins
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  });

  try {
    const data = await s3Client.send(command);
    console.log(`Successfully configured CORS for bucket: ${bucketName}`);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error configuring CORS:", error);
    if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
    }
  }
}

configureCors().then(() => console.log("Script finished."));
