import type { FilePresignRequest, FilePresignResponse } from "@loveleaf/types";
import type { ApiRequestOptions } from "./client";

export const presignUpload = async (
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>,
  payload: FilePresignRequest,
) => {
  return request<FilePresignResponse>("/files/presign", {
    method: "POST",
    body: payload,
  });
};

export const uploadToPresignedUrl = async (
  uploadUrl: string,
  body: Blob | ArrayBuffer,
  contentType?: string,
) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType ?? "application/octet-stream",
    },
    body: body as BodyInit,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Upload failed.");
  }
};
