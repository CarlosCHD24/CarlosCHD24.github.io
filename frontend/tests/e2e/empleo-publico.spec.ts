import { expect, test } from "@playwright/test";

test("starts with opportunities open for application and keeps the full master one action away", async ({ page }) => {
  await page.goto("/empleo-publico");

  await expect(page.getByRole("heading", { level: 1, name: "Oportunidades de empleo público" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Para inscribirme 19" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("19 de 302 resultados", { exact: true })).toBeVisible();
  await expect(page.getByRole("table", { name: "Oportunidades de empleo público filtradas" })).toBeVisible();

  await page.getByRole("button", { name: "Todas 302" }).click();
  await expect(page.getByText("302 de 302 resultados", { exact: true })).toBeVisible();
});

test("separates internal promotion and provision from the application view", async ({ page }) => {
  await page.goto("/empleo-publico");

  const filterPanel = page.locator('details:has(> summary[aria-label="Mostrar u ocultar filtros"])');
  await filterPanel.locator(":scope > summary").click();
  const search = page.getByRole("searchbox", { name: "Buscar" });
  await search.fill("Subinspector/a de Policía Local — 5 plazas promoción interna");
  await expect(page.getByText("0 de 302 resultados", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Todas 302" }).click();
  const internalResult = page.getByRole("row").filter({ has: page.getByRole("button", { name: "Subinspector/a de Policía Local — 5 plazas promoción interna" }) });
  await expect(internalResult).toBeVisible();
  await expect(internalResult.getByText("Promoción interna", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Para inscribirme 19" }).click();
  await search.fill("Director de la Asesoría Jurídica — libre designación");
  await expect(page.getByText("0 de 302 resultados", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Todas 302" }).click();
  const provisionResult = page.getByRole("row").filter({ has: page.getByRole("button", { name: "Director de la Asesoría Jurídica — libre designación" }) });
  await expect(provisionResult.getByText("Provisión restringida", { exact: true })).toBeVisible();
});

test("preserves active pools even when their selection process is completed", async ({ page }) => {
  await page.goto("/empleo-publico");

  await page.getByRole("button", { name: "Bolsas vigentes 29" }).click();
  await expect(page.getByText("29 de 302 resultados", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Técnico Auxiliar de Logística y Transporte — bolsa constituida" })).toBeVisible();
  await expect(page.getByText("Bolsa vigente", { exact: true }).first()).toBeVisible();
});

test("shows deadlines, restrictions and the reviewed lifecycle overlap", async ({ page }) => {
  await page.goto("/empleo-publico");

  await expect(page.getByRole("button", { name: "Bolsa docente — Profesores de Enseñanza Secundaria — Dibujo" })).toBeVisible();
  const desktopTable = page.getByRole("table", { name: "Oportunidades de empleo público filtradas" });
  await expect(desktopTable.getByText("Solo integrantes de otra bolsa", { exact: true })).toBeVisible();
  await expect(desktopTable.getByText("Abierta hasta 16/09/2026", { exact: true })).toBeVisible();

  const drawingRow = desktopTable.getByRole("row").filter({ has: page.getByRole("button", { name: "Bolsa docente — Profesores de Enseñanza Secundaria — Dibujo" }) });
  await drawingRow.getByRole("button", { name: "Bolsa docente — Profesores de Enseñanza Secundaria — Dibujo" }).click();
  const drawingDetails = drawingRow.locator("+ tr");
  await expect(drawingDetails.getByText("Datos administrativos superpuestos", { exact: true })).toBeVisible();
  await expect(drawingDetails.getByText("Desde 03/09/2026 hasta 16/09/2026", { exact: true })).toBeVisible();
  await expect(drawingDetails.getByRole("link", { name: /Abrir publicación/ }).first()).toBeVisible();
});

test("keeps advanced multiple filters within each view", async ({ page }) => {
  await page.goto("/empleo-publico");
  await page.getByRole("button", { name: "Todas 302" }).click();

  const filterPanel = page.locator('details:has(> summary[aria-label="Mostrar u ocultar filtros"])');
  await expect(filterPanel).not.toHaveAttribute("open", "");
  await filterPanel.locator(":scope > summary").click();

  const processFilter = filterPanel.locator('details:has(> summary[aria-label^="Proceso:"])');
  await processFilter.locator("summary").click();
  await processFilter.getByRole("checkbox", { name: "Plazas", exact: true }).check();
  await processFilter.getByRole("checkbox", { name: "Bolsas", exact: true }).check();
  await expect(processFilter.locator("summary")).toHaveAttribute("aria-label", "Proceso: 2 seleccionados");
  await expect(filterPanel.getByText("1 categoría activa · 2 valores", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(page.getByRole("button", { name: "Todas 302" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("302 de 302 resultados", { exact: true })).toBeVisible();
});

test("applies reversible quick exclusions with visible counts and removable chips", async ({ page }) => {
  await page.goto("/empleo-publico");
  await page.getByRole("button", { name: "Todas 302" }).click();

  const hideHistorical = page.getByRole("button", { name: /^Ocultar histórico/ });
  await expect(hideHistorical).toContainText("apartadas");
  await hideHistorical.click();
  await expect(hideHistorical).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Quitar filtro Ocultar histórico" })).toBeVisible();
  await expect(page.getByText(/de 302 resultados/, { exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Quitar filtro Ocultar histórico" }).click();
  await expect(page.getByText("302 de 302 resultados", { exact: true })).toBeVisible();
});

test("separates active and planned pools in filters, summaries and result labels", async ({ page }) => {
  await page.goto("/empleo-publico");
  await page.getByRole("button", { name: "Todas 302" }).click();
  const filterPanel = page.locator('details:has(> summary[aria-label="Mostrar u ocultar filtros"])');
  await filterPanel.locator(":scope > summary").click();

  const poolStatus = filterPanel.locator('details:has(> summary[aria-label^="Estado de bolsa:"])');
  await poolStatus.locator("summary").click();
  await poolStatus.getByRole("checkbox", { name: "Vigente", exact: true }).check();
  await expect(page.getByText("29 de 302 resultados", { exact: true })).toBeVisible();
  await expect(page.getByText("Bolsas vigentes").last()).toBeVisible();

  await poolStatus.getByRole("checkbox", { name: "Vigente", exact: true }).uncheck();
  await poolStatus.getByRole("checkbox", { name: "Prevista", exact: true }).check();
  await expect(page.getByText("74 de 302 resultados", { exact: true })).toBeVisible();
  await expect(page.getByText("Bolsa prevista", { exact: true }).first()).toBeVisible();
});

test("shows the decision data, official CTA and transparency details in each desktop result", async ({ page }) => {
  await page.goto("/empleo-publico");
  const peonRow = page.getByRole("row").filter({ has: page.getByRole("button", { name: "Peón/a — 106 plazas" }) });
  await expect(peonRow.getByText("Acceso libre · incluye cupo reservado", { exact: true })).toBeVisible();
  await expect(peonRow.getByText("Cierra pronto · 11/09/2026", { exact: true })).toBeVisible();
  await expect(peonRow.getByRole("link", { name: /Ver convocatoria oficial/ })).toBeVisible();

  await peonRow.getByRole("button", { name: "Peón/a — 106 plazas" }).click();
  const peonDetails = peonRow.locator("+ tr");
  await expect(peonDetails.getByRole("heading", { name: "Transparencia del dato" })).toBeVisible();
  await expect(peonDetails.getByText("Necesita revisión", { exact: true })).toBeVisible();
});

test("uses stacked decision cards without horizontal listing scroll on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/empleo-publico");

  await expect(page.getByRole("table", { name: "Oportunidades de empleo público filtradas" })).toBeHidden();
  const cards = page.locator('[aria-label="Oportunidades de empleo público filtradas"]');
  await expect(cards).toBeVisible();
  const peonCard = cards.getByRole("article").filter({ hasText: "Peón/a — 106 plazas" });
  await expect(peonCard.getByText("Ubicación", { exact: true })).toBeVisible();
  await expect(peonCard.getByText("Acceso", { exact: true })).toBeVisible();
  await expect(peonCard.getByText("Plazo", { exact: true })).toBeVisible();
  await expect(peonCard.getByRole("link", { name: /Ver convocatoria oficial/ })).toBeVisible();
  expect(await peonCard.locator("dt").allTextContents()).toEqual([
    "Ubicación",
    "Acceso",
    "Estado",
    "Plazo",
    "Plazas",
  ]);
});

test("supports keyboard activation for filters, details and the official action", async ({ page }) => {
  await page.goto("/empleo-publico");

  const generalOnly = page.getByRole("button", { name: /^Acceso general/ });
  await generalOnly.focus();
  await page.keyboard.press("Enter");
  await expect(generalOnly).toHaveAttribute("aria-pressed", "true");

  const resultButton = page.getByRole("button", { name: "Peón/a — 106 plazas" });
  await resultButton.focus();
  await page.keyboard.press("Enter");
  await expect(resultButton).toHaveAttribute("aria-expanded", "true");

  const officialLink = page.getByRole("table", { name: "Oportunidades de empleo público filtradas" })
    .getByRole("link", { name: /Ver convocatoria oficial/ })
    .first();
  await officialLink.focus();
  await expect(officialLink).toBeFocused();
  await expect(officialLink).toHaveAttribute("href", /^https:\/\//);
});

test("explains citizen-facing states and does not expose contract enums", async ({ page }) => {
  await page.goto("/empleo-publico");
  await expect(page.getByText("Datos actualizados el 8 de septiembre de 2026", { exact: true })).toBeVisible();

  const stateHelp = page.locator("details").filter({ has: page.getByText("Cómo interpretar los estados", { exact: true }) });
  await stateHelp.locator("summary").click();
  await expect(stateHelp.getByText("La fuente indica que se admiten solicitudes ahora.", { exact: true })).toBeVisible();
  await expect(stateHelp.getByText(/no equivale a acceso general/)).toBeVisible();

  const peonRow = page.getByRole("row").filter({ has: page.getByRole("button", { name: "Peón/a — 106 plazas" }) });
  await peonRow.getByRole("button", { name: "Peón/a — 106 plazas" }).click();
  const details = peonRow.locator("+ tr");
  await expect(details.getByText("Personal laboral fijo", { exact: true })).toBeVisible();
  await expect(details.getByText("Estudios primarios o equivalente", { exact: true })).toBeVisible();
  await expect(details.getByText("Plazo con fechas determinadas", { exact: true })).toBeVisible();
  await expect(details).toContainText("Convocatoria");
  await expect(details).not.toContainText("LABOR_FIXED");
  await expect(details).not.toContainText("FIXED_WINDOW");
});

test("covers the five intent views as user journeys without fixed transition totals", async ({ page }) => {
  await page.goto("/empleo-publico");
  const labels = ["Para inscribirme", "Próximas", "Bolsas vigentes", "Participación iniciada", "Todas"];
  const allButton = page.getByRole("button", { name: /^Todas \d+$/ });
  const total = Number((await allButton.textContent())?.match(/\d+/)?.[0]);

  for (const label of labels) {
    const button = page.getByRole("button", { name: new RegExp(`^${label} \\d+$`) });
    const expected = Number((await button.textContent())?.match(/\d+/)?.[0]);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(`${expected} de ${total} resultados`, { exact: true })).toBeVisible();
  }
});

test("finds natural multi-term searches and offers recovery when no result matches", async ({ page }) => {
  await page.goto("/empleo-publico");
  const filterPanel = page.locator('details:has(> summary[aria-label="Mostrar u ocultar filtros"])');
  await filterPanel.locator(":scope > summary").click();
  const search = page.getByRole("searchbox", { name: "Buscar" });

  await search.fill("Dibujo, bolsa Profesores Secundaria docente");
  await expect(page.getByRole("button", { name: "Bolsa docente — Profesores de Enseñanza Secundaria — Dibujo" })).toBeVisible();

  await search.fill("oportunidad totalmente inexistente xyz");
  const desktopResults = page.getByRole("table", { name: "Oportunidades de empleo público filtradas" }).locator("..");
  await expect(desktopResults.getByText("Prueba a quitar algún término o filtro.", { exact: true })).toBeVisible();
  await desktopResults.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(search).toHaveValue("");
});

test("persists and shares filters, order, page size and page in the URL", async ({ page }) => {
  await page.goto("/empleo-publico");
  await expect(page).not.toHaveURL(/\?/);
  await page.getByRole("button", { name: /^Todas \d+$/ }).click();

  const filterPanel = page.locator('details:has(> summary[aria-label="Mostrar u ocultar filtros"])');
  await filterPanel.locator(":scope > summary").click();
  await page.getByRole("searchbox", { name: "Buscar" }).fill("peón Sevilla");
  await page.getByLabel("Orden").selectOption("vacancies");
  await page.getByLabel("Resultados por página").selectOption("50");
  await expect(page).toHaveURL(/view=all/);
  await expect(page).toHaveURL(/q=pe%C3%B3n\+Sevilla/);
  await expect(page).toHaveURL(/sort=vacancies/);
  await expect(page).toHaveURL(/size=50/);

  const sharedUrl = page.url();
  await page.reload();
  await expect(page).toHaveURL(sharedUrl);
  await filterPanel.locator(":scope > summary").click();
  await expect(page.getByRole("searchbox", { name: "Buscar" })).toHaveValue("peón Sevilla");
  await expect(page.getByLabel("Orden")).toHaveValue("vacancies");
  await expect(page.getByRole("button", { name: "Peón/a — 106 plazas" })).toBeVisible();

  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await page.getByLabel("Resultados por página").selectOption("25");
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page).toHaveURL(/page=2/);
  await page.reload();
  await expect(page.getByText(/Página 2 de/)).toBeVisible();
});

test("restores view state with browser history and sanitizes unknown URL values", async ({ page }) => {
  await page.goto("/empleo-publico");
  await page.getByRole("button", { name: /^Todas \d+$/ }).click();
  await expect(page).toHaveURL(/view=all/);
  await page.getByRole("button", { name: /^Próximas \d+$/ }).click();
  await expect(page).toHaveURL(/view=upcoming/);

  await page.goBack();
  await expect(page.getByRole("button", { name: /^Todas \d+$/ })).toHaveAttribute("aria-pressed", "true");
  await page.goForward();
  await expect(page.getByRole("button", { name: /^Próximas \d+$/ })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/empleo-publico?view=INVALID&sort=RANDOM&process=DROP_TABLE&page=-4");
  await expect(page.getByRole("button", { name: /^Para inscribirme \d+$/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page).not.toHaveURL(/INVALID|RANDOM|DROP_TABLE|page=-4/);
});

test("exposes dataset coverage and download", async ({ page }) => {
  await page.goto("/empleo-publico");
  const datasetFooter = page.getByRole("region", { name: "Cobertura y descarga" });
  await expect(datasetFooter).toBeVisible();
  await expect(datasetFooter.getByText("21 abr — 8 sep 2026", { exact: true })).toBeVisible();
  await expect(datasetFooter.getByRole("link", { name: /Descargar JSONL/ })).toBeVisible();
});
