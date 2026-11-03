import "server-only";

import { AwsClient } from "aws4fetch";

// Photos uploaded from the admin panel live in a Cloudflare R2 bucket and are served from R2_PUBLIC_URL
// (e.g. https://img.jogja-transport.com). The browser uploads straight to R2 with a short-lived signed URL,
// so large files never pass through the Node server on cPanel.

const UPLOAD_URL_SECONDS = 600;

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

function r2Config(): R2Config | null {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) return null;
  return { accountId: R2_ACCOUNT_ID, accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, bucket: R2_BUCKET };
}

export function isR2Configured() {
  return r2Config() !== null && Boolean(process.env.R2_PUBLIC_URL);
}

function requireR2() {
  const config = r2Config();
  if (!config) throw new Error("R2 isn't configured: set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET");
  const client = new AwsClient({ accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey, service: "s3", region: "auto" });
  const objectUrl = (key: string) => `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${key}`;
  return { client, objectUrl };
}

/** A URL the browser can PUT one file to for the next ten minutes. */
export async function presignUpload(key: string, contentType: string) {
  const { client, objectUrl } = requireR2();
  const url = new URL(objectUrl(key));
  url.searchParams.set("X-Amz-Expires", String(UPLOAD_URL_SECONDS));
  const signed = await client.sign(new Request(url, { method: "PUT", headers: { "content-type": contentType } }), {
    aws: { signQuery: true },
  });
  return signed.url;
}

export async function deleteObject(key: string) {
  const { client, objectUrl } = requireR2();
  const response = await client.fetch(objectUrl(key), { method: "DELETE" });
  if (!response.ok && response.status !== 404) {
    throw new Error(`R2 delete of "${key}" failed with ${response.status}`);
  }
}
