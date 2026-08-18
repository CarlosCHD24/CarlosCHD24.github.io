import { expect, test } from "@playwright/test";

for (const path of ["/", "/empleo-publico"] as const) {
  test(`${path} renders the public-employment explorer`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.ok()).toBe(true);
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Oportunidades de empleo público",
      }),
    ).toBeVisible();
  });
}

for (const path of ["/research", "/teaching", "/ddcf"] as const) {
  test(`${path} from the retired portfolio is no longer published`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  });
}
