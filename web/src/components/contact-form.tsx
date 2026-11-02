"use client";

import { type FormEvent, useId, useRef, useState } from "react";

export type ContactFormCopy = {
  formTitle: string;
  nameLabel: string;
  emailLabel: string;
  subjectLabel: string;
  messageLabel: string;
  consentLabel: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  errorMessage: string;
  uncertainMessage: string;
};

type FormStatus = "idle" | "pending" | "success" | "error" | "uncertain";

export function ContactForm({ copy }: { copy: ContactFormCopy }) {
  const id = useId();
  const submissionId = useRef<string | null>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const pending = status === "pending";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    submissionId.current ??= crypto.randomUUID();
    setStatus("pending");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          submissionId: submissionId.current,
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      form.reset();
      submissionId.current = null;
      setStatus("success");
    } catch {
      setStatus("uncertain");
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const statusMessage = status === "success"
    ? copy.successMessage
    : status === "error"
      ? copy.errorMessage
      : status === "uncertain"
        ? copy.uncertainMessage
        : "";

  return (
    <form className="contact-form" onSubmit={handleSubmit} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{copy.formTitle}</h2>
      <div className="contact-form-grid">
        <label htmlFor={`${id}-name`}>
          <span>{copy.nameLabel}</span>
          <input id={`${id}-name`} name="name" type="text" autoComplete="name" minLength={2} maxLength={80} required disabled={pending} />
        </label>
        <label htmlFor={`${id}-email`}>
          <span>{copy.emailLabel}</span>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" maxLength={254} required disabled={pending} />
        </label>
        <label className="contact-form-wide" htmlFor={`${id}-subject`}>
          <span>{copy.subjectLabel}</span>
          <input id={`${id}-subject`} name="subject" type="text" minLength={3} maxLength={120} required disabled={pending} />
        </label>
        <label className="contact-form-wide" htmlFor={`${id}-message`}>
          <span>{copy.messageLabel}</span>
          <textarea id={`${id}-message`} name="message" minLength={20} maxLength={5000} rows={7} required disabled={pending} />
        </label>
      </div>
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" autoComplete="off" tabIndex={-1} />
      </div>
      <label className="contact-consent" htmlFor={`${id}-consent`}>
        <input id={`${id}-consent`} name="consent" type="checkbox" required disabled={pending} />
        <span>{copy.consentLabel}</span>
      </label>
      <div className="contact-form-footer">
        <button className="contact-submit" type="submit" disabled={pending}>
          {pending ? copy.submittingLabel : copy.submitLabel}
        </button>
        <p className={`contact-status contact-status-${status}`} role="status" aria-live="polite">{statusMessage}</p>
      </div>
    </form>
  );
}
