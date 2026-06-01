#!/usr/bin/env python3
import asyncio
from playwright.async_api import async_playwright
from maps_common import accept_cookies_if_present_async, extract_place_contacts_async
from pipeline_core import configure_playwright_page, launch_fast_browser_async

URL = "https://www.google.com/maps/place/Viktorio+L%27art+du+Cheveu"


async def main():
    async with async_playwright() as p:
        browser, ctx = await launch_fast_browser_async(p, headless=True)
        page = await ctx.new_page()
        configure_playwright_page(page)
        await page.goto(URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(3500)
        await accept_cookies_if_present_async(page)
        website, phone = await extract_place_contacts_async(page, fast=False)
        print("RESULT:", {"website": website, "phone": phone})
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
