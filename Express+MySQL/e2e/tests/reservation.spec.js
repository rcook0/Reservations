import { test, expect } from "@playwright/test";

test("Book a seat successfully", async ({ page }) => {
  // Visit frontend
  await page.goto("http://localhost:5173");

  // Expect title
  await expect(page.locator("h1")).toContainText("Airline Reservation System");

  // Fill booking form
  await page.fill('input[placeholder="Passenger ID"]', "3"); // Charlie
  await page.fill('input[placeholder="Departure Date YYYY-MM-DD"]', "2025-09-22");
  await page.fill('input[placeholder="Airline Code"]', "AA");
  await page.fill('input[placeholder="Flight Number"]', "3003");
  await page.fill('input[placeholder="Seat Number"]', "20B");

  // Submit
  await page.click("button:has-text('Book')");

  // Check success message
  await expect(page.locator("text=Reservation confirmed ✅")).toBeVisible();
});

test("Prevent double booking", async ({ page }) => {
  // Try booking same seat again
  await page.goto("http://localhost:5173");

  await page.fill('input[placeholder="Passenger ID"]', "1");
  await page.fill('input[placeholder="Departure Date YYYY-MM-DD"]', "2025-09-22");
  await page.fill('input[placeholder="Airline Code"]', "AA");
  await page.fill('input[placeholder="Flight Number"]', "3003");
  await page.fill('input[placeholder="Seat Number"]', "20B");

  await page.click("button:has-text('Book')");

  // Should fail
  await expect(page.locator("text=Seat not available")).toBeVisible();
});
