// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactForm, type ContactFormCopy } from "./contact-form";

const copy: ContactFormCopy = {
  formTitle: "Send a message",
  nameLabel: "Name",
  emailLabel: "Email",
  subjectLabel: "Subject",
  messageLabel: "Message",
  consentLabel: "I agree to the privacy note.",
  submitLabel: "Send message",
  submittingLabel: "Sending…",
  successMessage: "Thanks — your message has been sent.",
  errorMessage: "The message could not be sent.",
  uncertainMessage: "Delivery could not be confirmed.",
};

const completeForm = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.type(screen.getByLabelText("Subject"), "A useful project");
  await user.type(screen.getByLabelText("Message"), "This is a detailed project message for you.");
  await user.click(screen.getByLabelText("I agree to the privacy note."));
  return user;
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ContactForm", () => {
  it("renders explicit labels and keeps the honeypot out of the accessibility tree", () => {
    const { container } = render(<ContactForm copy={copy} />);

    expect(screen.getByLabelText("Name")).toHaveAttribute("name", "name");
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Message")).toHaveAttribute("name", "message");
    const honeypot = container.querySelector<HTMLInputElement>('input[name="website"]');
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot?.closest("div")).toHaveAttribute("aria-hidden", "true");
  });

  it("disables the submit button while delivery is pending", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
    const user = await (async () => {
      render(<ContactForm copy={copy} />);
      return completeForm();
    })();

    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
  });

  it("resets fields after confirmed success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ code: "sent" }), { status: 200 })));
    render(<ContactForm copy={copy} />);
    const user = await completeForm();

    await user.click(screen.getByRole("button", { name: "Send message" }));

    await screen.findByText(copy.successMessage);
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("I agree to the privacy note.")).not.toBeChecked();
  });

  it("keeps user input and announces uncertain delivery on a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("network interrupted"); }));
    render(<ContactForm copy={copy} />);
    await completeForm();

    fireEvent.submit(screen.getByRole("button", { name: "Send message" }).closest("form")!);

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(copy.uncertainMessage));
    expect(screen.getByLabelText("Name")).toHaveValue("Ada Lovelace");
  });
});
