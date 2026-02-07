
import { S3Client, GetBucketCorsCommand } from "@aws-sdk/client-s3";
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

async function checkCors() {
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  if (!bucketName) {
    console.error("Bucket name is not defined in environment variables.");
    return;
  }

  const command = new GetBucketCorsCommand({
    Bucket: bucketName,
  });

  try {
    const response = await s3Client.send(command);
    console.log(`CORS Configuration for bucket: ${bucketName}`);
    console.log(JSON.stringify(response.CORSRules, null, 2));
  } catch (error) {
    console.error("Error fetching CORS configuration:", error);
  }
}

checkCors();
