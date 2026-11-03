from __future__ import annotations

import os
from pathlib import Path

from playwright.sync_api import Page, sync_playwright


BASE_URL = os.getenv("E2E_BASE_URL", "http://127.0.0.1:3000")
CHROME_PATH = os.getenv("CHROME_PATH", "/usr/bin/google-chrome") or None
ARTIFACTS = Path(os.getenv("E2E_ARTIFACTS", "artifacts/e2e"))
SANITY_PROJECT_ID = os.getenv("NEXT_PUBLIC_SANITY_PROJECT_ID", "x34rtnfv")
SANITY_DATASET = os.getenv("NEXT_PUBLIC_SANITY_DATASET", "production")
SANITY_API_VERSION = os.getenv("NEXT_PUBLIC_SANITY_API_VERSION", "2026-11-02")


def assert_no_horizontal_overflow(page: Page) -> None:
    overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    assert not overflow, "page has horizontal overflow"


def run_desktop_flow(page: Page) -> None:
    console_errors: list[str] = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)

    page.goto(f"{BASE_URL}/en", wait_until="networkidle")
    page.get_by_role("heading", name="I turn complex ideas into useful web products.").wait_for()
    page.get_by_role("link", name="View projects").wait_for()
    page.screenshot(path=ARTIFACTS / "desktop-home.png", full_page=True)
    page.keyboard.press("Tab")
    assert page.locator(":focus").get_attribute("href") == "#main-content"
    page.get_by_role("link", name="View projects").click()
    page.wait_for_url("**/en/projects")
    page.get_by_role("heading", name="Work, decisions, and what I learned.").wait_for()

    page.get_by_role("link", name="About", exact=True).click()
    page.wait_for_url("**/en/about")
    page.get_by_text("Think3ddd", exact=True).wait_for()
    page.get_by_role("heading", name="Professional experience").wait_for()
    detail_grid = page.locator(".content-grid").bounding_box()
    final_detail = page.locator(".content-panel").last.bounding_box()
    assert detail_grid and final_detail
    assert abs(detail_grid["width"] - final_detail["width"]) <= 3, "final CV detail should span the full grid"
    page.screenshot(path=ARTIFACTS / "desktop-about.png", full_page=True)

    page.get_by_role("link", name="Contact", exact=True).click()
    page.wait_for_url("**/en/contact")
    page.get_by_role("heading", name="Send a message").wait_for()
    page.get_by_label("Email").wait_for()
    assert page.locator('a[href^="mailto:"]').count() == 0
    page.screenshot(path=ARTIFACTS / "desktop-contact.png", full_page=True)

    page.goto(f"{BASE_URL}/en/projects/neuer-tag-ev", wait_until="networkidle")
    page.get_by_role("heading", name="Neuer Tag e.V.").wait_for()
    page.get_by_role("link", name="Visit live website").wait_for()
    page.screenshot(path=ARTIFACTS / "desktop-project.png", full_page=True)

    studio_response = page.request.get(f"{BASE_URL}/studio", max_redirects=0)
    assert studio_response.status in (307, 308), "portfolio should redirect to the hosted Sanity Studio"
    assert studio_response.headers.get("location") == "https://rebvar-portfolio.sanity.studio/"

    cms_response = page.request.get(
        f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{SANITY_DATASET}",
        params={
            "perspective": "published",
            "query": '{"settings": *[_id == "portfolio-site-settings"][0]._id, "projects": count(*[_type == "portfolioProject"])}',
        },
    )
    assert cms_response.ok, "public Sanity query should succeed without a token"
    cms_result = cms_response.json().get("result", {})
    assert cms_result.get("settings") == "portfolio-site-settings", "published site settings should be public"
    assert cms_result.get("projects") == 4, "all four published projects should be public"

    rejection = page.request.post(
        f"{BASE_URL}/api/contact",
        headers={"Origin": BASE_URL, "Content-Type": "text/plain"},
        data="{}",
    )
    assert rejection.status == 415, "contact API should reject non-JSON requests"

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
