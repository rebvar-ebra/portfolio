import { SIGNATURE_HEADER_NAME, isValidSignature } from "@sanity/webhook";
import { revalidateTag } from "next/cache";

import { portfolioFreshReadWindow } from "@/sanity/lib/cache-state";

type WebhookBody = { _type?: string } | null;
type ParsedWebhook = { body: WebhookBody; isValidSignature: boolean | null };

export type WebhookParser = (request: Request, secret: string, waitForConsistency: boolean) => Promise<ParsedWebhook>;
type CacheInvalidator = (tag: string) => void;

const portfolioTypes = new Set(["portfolioSiteSettings", "portfolioProject"]);
const MAX_WEBHOOK_BYTES = 65_536;

const boundedRequest = async (request: Request) => {
  if (!request.body) return request;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_WEBHOOK_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const headers = new Headers(request.headers);
  headers.delete("content-length");
  return new Request(request.url, { method: request.method, headers, body });
};

export const createRevalidateHandler = (
  parser: WebhookParser,
  invalidate: CacheInvalidator,
  secret: string | undefined,
  markFreshRead: () => void = () => undefined,
) => async (request: Request) => {
  if (!secret) return Response.json({ message: "Webhook is not configured" }, { status: 503 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ message: "Unsupported media type" }, { status: 415 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BYTES) {
    return Response.json({ message: "Payload too large" }, { status: 413 });
  }

  try {
    const safeRequest = await boundedRequest(request);
    if (!safeRequest) return Response.json({ message: "Payload too large" }, { status: 413 });
    const { body, isValidSignature } = await parser(safeRequest, secret, true);
    if (isValidSignature !== true) return Response.json({ message: "Invalid signature" }, { status: 401 });
    if (!body?._type || !portfolioTypes.has(body._type)) {
      return Response.json({ revalidated: false }, { status: 202 });
    }

    markFreshRead();
    invalidate("portfolio");
    return Response.json({ revalidated: true, type: body._type });
  } catch {
    return Response.json({ message: "Invalid webhook payload" }, { status: 400 });
  }
};

const parseWebhook: WebhookParser = async (request, secret, waitForConsistency) => {
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature) return { body: null, isValidSignature: null };

  const rawBody = await request.text();
  const validSignature = await isValidSignature(rawBody, signature, secret.trim());
  if (validSignature && waitForConsistency) {
    await new Promise((resolve) => setTimeout(resolve, 3_000));
  }

  return {
    body: rawBody.trim() ? JSON.parse(rawBody) as WebhookBody : null,
    isValidSignature: validSignature,
  };
};

export const POST = createRevalidateHandler(
  parseWebhook,
  (tag) => revalidateTag(tag, { expire: 0 }),
  process.env.SANITY_REVALIDATE_SECRET,
  () => portfolioFreshReadWindow.mark(),
);

