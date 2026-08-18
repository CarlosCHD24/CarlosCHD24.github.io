import { expect, test } from "@playwright/test";

test("employment explorer loads the master dataset and filters results", async ({ page }) => {
  await page.goto("/empleo-publico");

  await expect(page.getByRole("heading", { level: 1, name: "Oportunidades de empleo público" })).toBeVisible();
  await expect(page.getByText("236", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("table", { name: "Oportunidades de empleo público filtradas" })).toBeVisible();

  const filterPanel = page.locator('details:has(> summary[aria-label="Mostrar u ocultar filtros"])');
  await expect(filterPanel).not.toHaveAttribute("open", "");
  await filterPanel.locator(":scope > summary").click();
  await expect(filterPanel).toHaveAttribute("open", "");

  const search = page.getByRole("searchbox", { name: "Buscar" });
  await search.fill("Mantenedor de Instalaciones");
  await expect(page.getByRole("button", { name: /Mantenedor de Instalaciones/ }).first()).toBeVisible();

  await search.fill("");
  const hideFinished = page.getByRole("button", { name: /finalizadas/ });
  await hideFinished.click();
  await expect(hideFinished).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("211 de 236 resultados", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "25 finalizadas ocultas" })).toBeVisible();

  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(page.getByRole("button", { name: "Ocultar 25 finalizadas" })).toHaveAttribute("aria-pressed", "false");

  const processFilter = filterPanel.locator('details:has(> summary[aria-label^="Proceso:"])');
  await processFilter.locator("summary").click();
  await processFilter.getByRole("checkbox", { name: "Plazas", exact: true }).check();
  await processFilter.getByRole("checkbox", { name: "Bolsas", exact: true }).check();
  await expect(processFilter.locator("summary")).toHaveAttribute("aria-label", "Proceso: 2 seleccionados");
  await expect(page.getByText("219 de 236 resultados", { exact: true })).toBeVisible();
  await expect(filterPanel.getByText("2 criterios activos", { exact: true })).toBeVisible();

  await filterPanel.locator(":scope > summary").click();
  await expect(filterPanel).not.toHaveAttribute("open", "");
  await expect(page.getByText("219 de 236 resultados", { exact: true })).toBeVisible();
  await filterPanel.locator(":scope > summary").click();

  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  const statusFilter = filterPanel.locator('details:has(> summary[aria-label^="Estado:"])');
  await statusFilter.locator("summary").click();
  await statusFilter.getByRole("checkbox", { name: "Necesita revisión" }).check();
  await expect(page.getByText("12", { exact: true }).first()).toBeVisible();

  const datasetFooter = page.getByRole("region", { name: "Cobertura y descarga" });
  await expect(datasetFooter).toBeVisible();
  await expect(datasetFooter.getByRole("link", { name: /Descargar JSONL/ })).toBeVisible();
});
