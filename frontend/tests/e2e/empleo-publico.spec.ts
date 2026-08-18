import { expect, test } from "@playwright/test";

test("employment explorer loads the master dataset and filters results", async ({ page }) => {
  await page.goto("/empleo-publico");

  await expect(page.getByRole("heading", { level: 1, name: "Oportunidades de empleo público" })).toBeVisible();
  await expect(page.getByText("236", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("table", { name: "Oportunidades de empleo público filtradas" })).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Buscar" });
  await search.fill("Mantenedor de Instalaciones");
  await expect(page.getByRole("button", { name: /Mantenedor de Instalaciones/ }).first()).toBeVisible();

  await search.fill("");
  await page.getByRole("checkbox", { name: "Solo registros para revisar" }).check();
  await expect(page.getByText("12", { exact: true }).first()).toBeVisible();
});
