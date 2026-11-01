from __future__ import annotations

import os
from pathlib import Path

from playwright.sync_api import Page, sync_playwright


BASE_URL = os.getenv("E2E_BASE_URL", "http://127.0.0.1:3000")
CHROME_PATH = os.getenv("CHROME_PATH", "/usr/bin/google-chrome") or None
ARTIFACTS = Path(os.getenv("E2E_ARTIFACTS", "artifacts/e2e"))
RESET_TOKEN = os.getenv("E2E_RESET_TOKEN", "local-reset-token-change-me")


def assert_no_horizontal_overflow(page: Page) -> None:
    overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    assert not overflow, "page has horizontal overflow"


def run_desktop_flow(page: Page) -> None:
    console_errors: list[str] = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)

    reset = page.request.post(
        f"{BASE_URL}/api/demo/reset",
        headers={"X-Demo-Reset-Token": RESET_TOKEN},
    )
    assert reset.status == 204, f"demo reset failed with {reset.status}"

    page.goto(f"{BASE_URL}/en", wait_until="networkidle")
    page.get_by_role("heading", name="I turn complex ideas into useful web products.").wait_for()
    page.get_by_role("link", name="View projects").wait_for()
    page.screenshot(path=ARTIFACTS / "desktop-home.png", full_page=True)
    page.keyboard.press("Tab")
    assert page.locator(":focus").get_attribute("href") == "#main-content"
    page.get_by_role("link", name="View projects").click()
    page.wait_for_url("**/en/projects")
    page.get_by_role("heading", name="Work, decisions, and what I learned.").wait_for()

    page.get_by_role("link", name="Lab").click()
    page.wait_for_url("**/en/lab")
    page.get_by_text("Live updates on").wait_for(timeout=15_000)
    page.get_by_label("Menu item").fill("Charred tomato gnocchi")
    page.get_by_label("Quantity").fill("2")
    page.get_by_role("button", name="Create order").click()
    card = page.get_by_role("article").filter(has_text="Charred tomato gnocchi")
    card.get_by_text("New", exact=True).wait_for()
    card.get_by_role("button", name="Start preparing").click()
    card.get_by_text("Preparing", exact=True).wait_for()
    page.get_by_role("button", name="Preparing", exact=True).click()
    card.wait_for()
    page.screenshot(path=ARTIFACTS / "desktop-lab.png", full_page=True)
    assert_no_horizontal_overflow(page)
    assert console_errors == [], f"browser console errors: {console_errors}"


def run_mobile_flow(page: Page) -> None:
    page.goto(f"{BASE_URL}/de", wait_until="networkidle")
    page.get_by_role("heading", name="Ich mache aus komplexen Ideen nützliche Webprodukte.").wait_for()
    page.screenshot(path=ARTIFACTS / "mobile-hero.png", full_page=False)
    page.get_by_role("button", name="Menü öffnen").click()
    page.get_by_role("link", name="Projekte", exact=True).wait_for()
    page.screenshot(path=ARTIFACTS / "mobile-home.png", full_page=True)
    assert_no_horizontal_overflow(page)


def main() -> None:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=CHROME_PATH)
        desktop = browser.new_page(viewport={"width": 1440, "height": 1000})
        run_desktop_flow(desktop)
        mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
        run_mobile_flow(mobile)
        browser.close()


if __name__ == "__main__":
    main()
