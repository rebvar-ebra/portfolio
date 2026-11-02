export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  subject: { min: 3, max: 120 },
  message: { min: 20, max: 5_000 },
} as const;

export type ContactSubmission = {
  submissionId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  consent: true;
};

export type ContactParseResult =
  | { ok: true; value: ContactSubmission }
  | { ok: false; reason: "invalid" | "spam" };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hasHeaderBreak = (value: string) => /[\r\n]/.test(value);

const bounded = (value: unknown, min: number, max: number) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length >= min && normalized.length <= max ? normalized : null;
};

export const parseContactSubmission = (input: unknown): ContactParseResult => {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, reason: "invalid" };
  const source = input as Record<string, unknown>;

  if (typeof source.website !== "string") return { ok: false, reason: "invalid" };
  if (source.website.trim()) return { ok: false, reason: "spam" };

  const submissionId = typeof source.submissionId === "string" ? source.submissionId.trim() : "";
  const name = bounded(source.name, CONTACT_LIMITS.name.min, CONTACT_LIMITS.name.max);
  const email = bounded(source.email, 3, CONTACT_LIMITS.email.max)?.toLowerCase() ?? null;
  const subject = bounded(source.subject, CONTACT_LIMITS.subject.min, CONTACT_LIMITS.subject.max);
  const message = bounded(source.message, CONTACT_LIMITS.message.min, CONTACT_LIMITS.message.max);

  if (
    !uuidPattern.test(submissionId)
    || !name
    || !email
    || !emailPattern.test(email)
    || !subject
    || !message
    || source.consent !== true
    || hasHeaderBreak(name)
    || hasHeaderBreak(email)
    || hasHeaderBreak(subject)
  ) {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, value: { submissionId, name, email, subject, message, consent: true } };
};

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

export const buildContactEmail = (submission: ContactSubmission) => ({
  subject: `Portfolio contact: ${submission.subject}`,
  replyTo: submission.email,
  html: [
    `<p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>`,
    `<p><strong>Subject:</strong> ${escapeHtml(submission.subject)}</p>`,
    `<p><strong>Message:</strong><br>${escapeHtml(submission.message).replaceAll("\n", "<br>")}</p>`,
  ].join("\n"),
  text: [
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Subject: ${submission.subject}`,
    "",
    submission.message,
  ].join("\n"),
});
