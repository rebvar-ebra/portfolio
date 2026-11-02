import { describe, expect, it } from "vitest";

import { buildContactEmail, parseContactSubmission } from "./contact";

const validPayload = (overrides: Record<string, unknown> = {}) => ({
  submissionId: "0f73c28e-93f6-4c71-858a-173fe340e2df",
  name: "Ada Lovelace",
  email: "ADA@example.com",
  subject: "A useful web project",
  message: "I would like to discuss a full-stack project with you.",
  consent: true,
  website: "",
  ...overrides,
});

describe("parseContactSubmission", () => {
  it("normalizes a valid submission", () => {
    const result = parseContactSubmission(validPayload({ name: "  Ada Lovelace  ", email: " ADA@Example.COM " }));

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({ name: "Ada Lovelace", email: "ada@example.com" }),
    });
  });

  it.each([
    ["name too short", { name: "A" }],
    ["name too long", { name: "a".repeat(81) }],
    ["invalid email", { email: "not-an-email" }],
    ["email too long", { email: `${"a".repeat(245)}@example.com` }],
    ["subject too short", { subject: "Hi" }],
    ["subject too long", { subject: "s".repeat(121) }],
    ["message too short", { message: "too short" }],
    ["message too long", { message: "m".repeat(5001) }],
    ["missing consent", { consent: false }],
    ["invalid UUID", { submissionId: "not-a-uuid" }],
    ["invalid honeypot type", { website: 42 }],
    ["non-object input", null],
  ])("rejects %s", (_label, overrides) => {
    const input = overrides === null ? null : validPayload(overrides);
    expect(parseContactSubmission(input)).toEqual({ ok: false, reason: "invalid" });
  });

  it.each(["name", "email", "subject"])("rejects CR/LF in %s", (field) => {
    expect(parseContactSubmission(validPayload({ [field]: "safe\r\nBcc: attacker@example.com" }))).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("classifies a filled honeypot without accepting the submission", () => {
    expect(parseContactSubmission(validPayload({ website: "https://spam.example" }))).toEqual({
      ok: false,
      reason: "spam",
    });
  });
});

describe("buildContactEmail", () => {
  it("escapes every user-controlled HTML field and produces plain text", () => {
    const parsed = parseContactSubmission(validPayload({
      name: "<b>Ada</b>",
      subject: "Project & partnership",
      message: "Hello <img src=x onerror=alert(1)>\nSecond line",
    }));
    if (!parsed.ok) throw new Error("Expected valid fixture");

    const email = buildContactEmail(parsed.value);

    expect(email.subject).toBe("Portfolio contact: Project & partnership");
    expect(email.replyTo).toBe("ada@example.com");
    expect(email.html).toContain("&lt;b&gt;Ada&lt;/b&gt;");
    expect(email.html).toContain("&lt;img src=x onerror=alert(1)&gt;<br>Second line");
    expect(email.html).not.toContain("<img");
    expect(email.text).toContain("Hello <img src=x onerror=alert(1)>");
  });
});
