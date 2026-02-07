
import { NextRequest, NextResponse } from "next/server";
import { s3Client } from "@/libs/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();

    const uniqueFilename = `${Date.now()}-${filename.replace(/\s+/g, "-")}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: uniqueFilename,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({
      url,
      publicUrl: `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${uniqueFilename}`,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
