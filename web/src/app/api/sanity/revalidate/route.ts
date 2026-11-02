import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

type WebhookBody = { _type?: string } | null;
type ParsedWebhook = { body: WebhookBody; isValidSignature: boolean | null };

export type WebhookParser = (request: Request, secret: string, waitForConsistency: boolean) => Promise<ParsedWebhook>;
type CacheInvalidator = (tag: string) => void;

const portfolioTypes = new Set(["portfolioSiteSettings", "portfolioProject"]);

export const createRevalidateHandler = (
  parser: WebhookParser,
  invalidate: CacheInvalidator,
  secret: string | undefined,
) => async (request: Request) => {
  if (!secret) return Response.json({ message: "Webhook is not configured" }, { status: 503 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ message: "Unsupported media type" }, { status: 415 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 65_536) {
    return Response.json({ message: "Payload too large" }, { status: 413 });
  }

  try {
    const { body, isValidSignature } = await parser(request, secret, false);
    if (isValidSignature !== true) return Response.json({ message: "Invalid signature" }, { status: 401 });
    if (!body?._type || !portfolioTypes.has(body._type)) {
      return Response.json({ revalidated: false }, { status: 202 });
    }

    invalidate("portfolio");
    return Response.json({ revalidated: true, type: body._type });
  } catch {
    return Response.json({ message: "Invalid webhook payload" }, { status: 400 });
  }
};

const parseWebhook: WebhookParser = (request, secret, waitForConsistency) =>
  parseBody<WebhookBody>(request as NextRequest, secret, waitForConsistency);

export const POST = createRevalidateHandler(
  parseWebhook,
  (tag) => revalidateTag(tag, "max"),
  process.env.SANITY_REVALIDATE_SECRET,
);

