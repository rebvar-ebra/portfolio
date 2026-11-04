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

export const buildContactEmail = (submission: ContactSubmission) => {
  const name = escapeHtml(submission.name);
  const email = escapeHtml(submission.email);
  const subject = escapeHtml(submission.subject);
  const message = escapeHtml(submission.message).replaceAll("\n", "<br>");

  return {
    subject: `Portfolio contact: ${submission.subject}`,
    replyTo: submission.email,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New portfolio inquiry</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f7f8;color:#07151d;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${name} sent a new message through rebvar.xyz.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f4f7f8;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background-color:#ffffff;border:1px solid #d8e1e5;">
            <tr>
              <td style="height:8px;background-color:#ff6534;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:28px 32px;background-color:#07151d;color:#ffffff;">
                <p style="margin:0 0 18px;font-size:15px;line-height:1;font-weight:700;color:#ff6534;">RE / BVAR</p>
                <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:700;color:#ffffff;">New portfolio inquiry</h1>
                <p style="margin:10px 0 0;font-size:15px;line-height:1.5;color:#b8c7ce;">A new message arrived through rebvar.xyz.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#eef3f5;border-left:4px solid #ff6534;">
                  <tr>
                    <td style="padding:20px 22px;">
                      <p style="margin:0 0 5px;font-size:19px;line-height:1.35;font-weight:700;color:#07151d;">${name}</p>
                      <p style="margin:0;font-size:14px;line-height:1.5;color:#58707c;"><a href="mailto:${email}" style="color:#1b596f;text-decoration:underline;">${email}</a></p>
                    </td>
                  </tr>
                </table>

                <p style="margin:28px 0 7px;font-size:13px;line-height:1.4;font-weight:700;color:#58707c;">Subject</p>
                <p style="margin:0;font-size:20px;line-height:1.45;font-weight:700;color:#07151d;">${subject}</p>

                <p style="margin:28px 0 7px;font-size:13px;line-height:1.4;font-weight:700;color:#58707c;">Message</p>
                <div style="padding:20px 22px;background-color:#f8fafb;border:1px solid #d8e1e5;font-size:16px;line-height:1.7;color:#20343e;overflow-wrap:anywhere;">${message}</div>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;">
                  <tr>
                    <td style="background-color:#ff6534;">
                      <a href="mailto:${email}" style="display:inline-block;padding:14px 22px;font-size:15px;line-height:1.2;font-weight:700;color:#07151d;text-decoration:none;">Reply to ${name}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;border-top:1px solid #d8e1e5;font-size:12px;line-height:1.5;color:#70848d;">Sent securely from the contact form at rebvar.xyz.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    text: [
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Subject: ${submission.subject}`,
      "",
      submission.message,
    ].join("\n"),
  };
};
