import { expect, test } from "@playwright/test";

const routes = ["/", "/research", "/teaching", "/ddcf", "/empleo-publico"] as const;
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "desktop", width: 1536, height: 960 },
] as const;

for (const viewport of viewports) {
  test.describe(`${viewport.name} viewport`, () => {
    test.use({ viewport });

    for (const route of routes) {
      test(`${route} has no horizontal overflow`, async ({ page }) => {
        await page.goto(route);
        await expect(page.locator("main#main-content")).toBeVisible();

        const dimensions = await page.evaluate(() => ({
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
        }));

        expect(dimensions.documentWidth).toBeLessThanOrEqual(
          dimensions.viewportWidth,
        );
      });
    }
  });
}

test("mobile navigation exposes all primary routes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page
    .getByRole("button", { name: "Open navigation menu" })
    .click();

  for (const label of ["Bio", "Research", "Teaching", "DDCF Hub", "Empleo público"]) {
    await expect(
      page.getByRole("link", { name: label, exact: true }),
    ).toBeVisible();
  }
});
