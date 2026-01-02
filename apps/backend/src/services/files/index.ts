import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env";

const isStorageEnabled = () => env.storage.mode === "s3";

let cachedClient: S3Client | null = null;

const getClient = () => {
  if (!isStorageEnabled()) return null;
  if (!env.storage.endpoint || !env.storage.accessKey || !env.storage.secretKey) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: env.storage.region || "auto",
      endpoint: env.storage.endpoint,
      credentials: {
        accessKeyId: env.storage.accessKey,
        secretAccessKey: env.storage.secretKey,
      },
    });
  }
  return cachedClient;
};

const sanitizeFileName = (name: string) => {
  const normalized = name.trim().replace(/\s+/g, "-");
  return normalized.replace(/[^a-zA-Z0-9._-]/g, "");
};

export type PresignResult = {
  fileId: string;
  path: string;
  uploadUrl: string;
  fileUrl: string;
};

export const presignUpload = async (params: {
  userId: string;
  fileName: string;
  contentType?: string | null;
  size?: number | null;
}): Promise<PresignResult> => {
  const client = getClient();
  if (!client || !env.storage.bucket) {
    throw new Error("Storage is not configured.");
  }

  const fileId = randomUUID();
  const safeName = sanitizeFileName(params.fileName) || "upload";
  const path = `${params.userId}/${fileId}/${safeName}`;

  const command = new PutObjectCommand({
    Bucket: env.storage.bucket,
    Key: path,
    ContentType: params.contentType ?? "application/octet-stream",
    ContentLength: params.size ?? undefined,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });
  const baseUrl = env.storage.publicBaseUrl.replace(/\/$/, "");
  const fileUrl = baseUrl ? `${baseUrl}/${path}` : "";

  return { fileId, path, uploadUrl, fileUrl };
};
