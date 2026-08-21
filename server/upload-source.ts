import { del } from "@vercel/blob";

const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

// Only fetch from Vercel Blob: the URL comes from the client, so anything else
// would let a caller point the server at arbitrary (or internal) hosts.
export async function fetchUploadBytes(url: string): Promise<Uint8Array> {
  const parsed = new URL(url);

  if (!parsed.hostname.endsWith(BLOB_HOST_SUFFIX)) {
    throw new Error("Upload URL is not a Vercel Blob URL");
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch upload (status ${response.status})`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

export async function deleteUpload(url: string): Promise<void> {
  await del(url);
}
