// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteContent } from "@/content/site";

import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en",
}));

afterEach(cleanup);

describe("SiteHeader", () => {
  it("closes the mobile menu after a navigation link is selected", async () => {
    const user = userEvent.setup();
    const { container } = render(<SiteHeader content={getSiteContent("en")} />);
    const menu = container.querySelector("details.mobile-menu");
    container.addEventListener("click", (event) => {
      if ((event.target as Element).closest("a")) event.preventDefault();
    });

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(menu).toHaveAttribute("open");

    await user.click(within(screen.getByRole("navigation", { name: "Mobile navigation" })).getByRole("link", { name: "Projects" }));

    expect(menu).not.toHaveAttribute("open");
  });
});
