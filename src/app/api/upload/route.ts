
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME,
    R2_PUBLIC_URL
} = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  throw new Error("Cloudflare R2 environment variables are not set.");
}

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileName = searchParams.get('fileName');
        const fileType = searchParams.get('fileType');
        
        if (!fileName || !fileType) {
            return NextResponse.json({ error: "fileName and fileType are required" }, { status: 400 });
        }
        
        const key = `${generateFileName()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });
        
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 }); // 5 minutes

        return NextResponse.json({ url, key });

    } catch (error) {
        console.error("Error generating signed URL:", error);
        return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
    }
}

