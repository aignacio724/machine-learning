import { expect, test } from "@playwright/test";

test("organizer creates an event, two participants respond, results highlight the best day", async ({
  page,
  browser,
}) => {
  // 1. Home page
  await page.goto("/");
  await expect(page.locator("#title")).toBeVisible();

  // 2. Create an event with a title and 3 candidate days
  await page.fill("#title", "Team Offsite");
  const dayButtons = page.locator("div.grid.grid-cols-7 button:not([disabled])");
  await dayButtons.nth(0).click();
  await dayButtons.nth(1).click();
  await dayButtons.nth(2).click();
  await page.getByRole("button", { name: "Create event" }).click();

  // 3. Redirected to /event/[id]
  await page.waitForURL(/\/event\/.+/);
  const eventUrl = page.url();
  await expect(page.getByRole("heading", { name: "Team Offsite" })).toBeVisible();

  // 4. First participant enters a name and marks availability across all three statuses
  await page.fill("#name", "Alice");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Marking availability as")).toBeVisible();

  const rows = page.locator("div.flex.items-center.justify-between.gap-3.rounded.border");
  await rows.nth(0).getByRole("button", { name: "Available", exact: true }).click();
  await rows.nth(1).getByRole("button", { name: "If Needed", exact: true }).click();
  // Day 3 is left at its default, "Not Available".

  // 5. Save and confirm the results summary updates
  await page.getByRole("button", { name: "Save my availability" }).click();
  await expect(page.getByText("Saved!")).toBeVisible();
  await expect(page.getByText("Results (1 response)")).toBeVisible();
  await expect(
    page.getByText("Best day — everyone's available")
  ).toBeVisible();

  // A second participant, in a separate browser context, marks every day as available.
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(eventUrl);
  await page2.fill("#name", "Bob");
  await page2.getByRole("button", { name: "Continue" }).click();
  const rows2 = page2.locator(
    "div.flex.items-center.justify-between.gap-3.rounded.border"
  );
  for (let i = 0; i < (await rows2.count()); i++) {
    await rows2.nth(i).getByRole("button", { name: "Available", exact: true }).click();
  }
  await page2.getByRole("button", { name: "Save my availability" }).click();
  await expect(page2.getByText("Results (2 responses)")).toBeVisible();
  await context2.close();

  // 6. Reload as Alice (same browser/localStorage) — pre-fills instead of duplicating
  await page.reload();
  await expect(page.getByText("Marking availability as")).toBeVisible();
  await expect(page.getByText("Alice")).toBeVisible();
  await expect(page.getByText("Results (2 responses)")).toBeVisible();

  const firstRowStatus = rows
    .nth(0)
    .locator("button.bg-green-600, button.bg-amber-500, button.bg-gray-400");
  await expect(firstRowStatus).toHaveText("Available");
});
