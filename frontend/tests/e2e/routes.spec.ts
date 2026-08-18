import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: /Joaquin\s+Garcia-Suarez/i },
  { path: "/research", heading: "Three Pillars of Research" },
  { path: "/teaching", heading: "Mentorship & Education" },
  { path: "/ddcf", heading: /Data-Driven\s+Computational Friction/i },
  { path: "/empleo-publico", heading: "Oportunidades de empleo público" },
] as const;

for (const route of routes) {
  test(`${route.path} renders its primary content`, async ({ page }) => {
    const response = await page.goto(route.path);

    expect(response?.ok()).toBe(true);
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: route.heading }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeVisible();
  });
}
