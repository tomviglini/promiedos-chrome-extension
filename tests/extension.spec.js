const { test: base, expect, chromium } = require("@playwright/test");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");

const extension = path.resolve(__dirname, "..");
const origen = "https://www.promiedos.com.ar";
const claveAlmacenamiento = "promiedos-focus:hidden-leagues:v1";
const tarjeta = (pagina, id) => pagina.locator(`[data-pmf-league="${id}"]`);
const ojo = (pagina, id) => tarjeta(pagina, id).locator(".pmf-toggle");

const test = base.extend({
  context: async ({}, use) => {
    const perfil = await fs.mkdtemp(path.join(os.tmpdir(), "promiedos-test-"));
    const contexto = await chromium.launchPersistentContext(perfil, {
      channel: "chromium", headless: true,
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, "--no-sandbox"],
    });
    const maqueta = await fs.readFile(path.join(__dirname, "fixtures/promiedos.html"), "utf8");
    await contexto.route("**/*", (ruta) => {
      const url = new URL(ruta.request().url());
      return url.origin === origen
        ? ruta.fulfill({ contentType: "text/html", body: maqueta })
        : ruta.fulfill({ status: 200, body: "" });
    });
    try { await use(contexto); }
    finally { await contexto.close(); await fs.rm(perfil, { recursive: true, force: true }); }
  },
});

async function abrir(pagina, camino = "/") {
  await pagina.goto(origen + camino);
  await expect(pagina.locator(".pmf-toggle")).toHaveCount(4);
}

async function ordenVisual(pagina) {
  return pagina.locator("[data-pmf-league]").evaluateAll((tarjetas) => tarjetas
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
    .map((elemento) => elemento.dataset.pmfLeague));
}

test("conserva el menú nativo en móvil y la navegación al cambiar el ancho", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await abrir(page);
  const encabezado = page.locator('header.header');
  const menu = page.getByRole('button', { name: 'Menú', exact: true });
  const enlace = page.locator('aside').getByRole('link', { name: 'Libertadores' });
  await expect(encabezado).toBeVisible();
  await expect(menu).toBeVisible();
  await expect(enlace).not.toBeInViewport();
  await menu.click();
  await expect(enlace).toBeInViewport();
  await menu.click();
  await expect(enlace).not.toBeInViewport();

  for (const ancho of [768, 1280]) {
    await page.setViewportSize({ width: ancho, height: 844 });
    await expect(encabezado).toBeHidden();
    await expect(enlace).toBeInViewport();
  }
  await page.setViewportSize({ width: 767, height: 844 });
  await expect(menu).toBeVisible();
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(enlace).toBeInViewport();
  await enlace.click();
  await expect(page).toHaveURL(origen + '/league/test/bac');
  await expect(menu).toBeVisible();
});

test("colapsa con el botón nativo, ordena al final y restaura sin tocar las campanas", async ({ page }) => {
  await abrir(page);
  await ojo(page, "bac").click();
  await ojo(page, "bae").click();
  await expect(tarjeta(page, "bac").locator(".item-event__content")).toHaveCount(0);
  await expect(tarjeta(page, "bae").locator(".item-event__content")).toHaveCount(0);
  await expect(ojo(page, "bac")).toHaveAttribute("aria-pressed", "true");
  expect(await ordenVisual(page)).toEqual(["dij", "zzz", "bac", "bae"]);
  expect(await page.evaluate(() => window.clicsNativos)).toEqual({ colapsar: 2, sonido: 0 });
  // El orden nativo del DOM queda intacto para la reconciliación de React del sitio.
  expect(await page.locator("[data-pmf-league]").evaluateAll((tarjetas) => tarjetas.map((t) => t.dataset.pmfLeague)))
    .toEqual(["bac", "dij", "bae", "zzz"]);
  await tarjeta(page, "bac").locator('[data-nativo="colapsar"]').click();
  await expect(tarjeta(page, "bac").locator(".item-event__content")).toHaveCount(0);
  await ojo(page, "bac").click();
  await expect(tarjeta(page, "bac").locator(".item-event__content")).toHaveCount(1);
  expect(await ordenVisual(page)).toEqual(["bac", "dij", "zzz", "bae"]);
  // El colapso manual normal sigue funcionando y no cambia las preferencias.
  await tarjeta(page, "dij").locator('[data-nativo="colapsar"]').click();
  await expect(tarjeta(page, "dij").locator(".item-event__content")).toHaveCount(0);
  await expect(ojo(page, "dij")).toHaveAttribute("aria-pressed", "false");
  await expect(ojo(page, "zzz")).toHaveAttribute("aria-pressed", "false");
});

test("persiste por ID al recargar y cambiar de fecha; sincroniza pestañas y borrado", async ({ page, context }) => {
  await abrir(page);
  await ojo(page, "bae").click();
  await page.reload();
  await expect(ojo(page, "bae")).toHaveAttribute("aria-pressed", "true");
  const otraPagina = await context.newPage();
  await abrir(otraPagina, "/games/16-09-2026");
  await expect(ojo(otraPagina, "bae")).toHaveAttribute("aria-pressed", "true");
  await ojo(otraPagina, "bac").click();
  await expect(ojo(page, "bac")).toHaveAttribute("aria-pressed", "true");
  await ojo(page, "bae").click();
  await expect(ojo(otraPagina, "bae")).toHaveAttribute("aria-pressed", "false");
  await expect(tarjeta(otraPagina, "bae").locator(".item-event__content")).toHaveCount(1);
  expect(await page.evaluate((clave) => JSON.parse(localStorage.getItem(clave)), claveAlmacenamiento)).toEqual(["bac"]);
  await otraPagina.evaluate(() => localStorage.clear());
  await expect(page.locator("[data-pmf-hidden]")).toHaveCount(0);
  await expect(tarjeta(page, "bac").locator(".item-event__content")).toHaveCount(1);
});

test("reaplica las preferencias al filtrar y al reemplazar bloques sin duplicar botones", async ({ page }) => {
  await abrir(page);
  await ojo(page, "bac").click();
  await page.evaluate(() => window.maqueta.renderizar([{ id: "dij", nombre: "Sudamericana" }]));
  await expect(page.locator(".pmf-toggle")).toHaveCount(1);
  await page.evaluate(() => window.maqueta.renderizar());
  await expect(page.locator(".pmf-toggle")).toHaveCount(4);
  await expect(tarjeta(page, "bac").locator(".item-event__content")).toHaveCount(0);
  await page.evaluate(() => window.maqueta.quitarCampanas());
  await expect(page.locator(".pmf-toggle")).toHaveCount(4);
  await expect(tarjeta(page, "bac").locator(".item-event__content")).toHaveCount(0);
  await page.evaluate(() => { document.querySelector('.score').textContent = '2 - 1'; });
  await expect(page.locator(".score").first()).toHaveText("2 - 1");
  expect(await page.evaluate(() => window.clicsNativos)).toEqual({ colapsar: 2, sonido: 0 });
});

test("oculta cuotas y banners dinámicos con su espacio; conserva otros avisos", async ({ page }) => {
  await abrir(page);
  await page.evaluate(() => window.maqueta.agregarBanners());
  await expect(page.locator("#banner-apuestas")).toBeHidden();
  await expect(page.locator("#banner-unico")).toBeHidden();
  await expect(page.locator("#competiciones")).toBeVisible();
  await expect(page.locator('[class*="greencuotas__"]')).toBeHidden();
  await expect(page.locator(".promotions")).toBeHidden();
  await expect(page.locator(".match-block__cof").first()).toBeHidden();
  await expect(page.locator('[class*="styles_badge__hashnuevo"]')).toBeHidden();
  await expect(page.locator("#insignia-ajena")).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
  await ojo(page, "bac").focus();
  await page.keyboard.press("Space");
  await expect(ojo(page, "bac")).toHaveAttribute("aria-pressed", "true");
  await expect(ojo(page, "bac")).toBeFocused();
});

test("tolera preferencias inválidas y permite ocultar todas las competiciones", async ({ page, context }) => {
  await context.addInitScript((clave) => localStorage.setItem(clave, "{json inválido"), claveAlmacenamiento);
  await abrir(page);
  for (const id of ["bac", "dij", "bae", "zzz"]) await ojo(page, id).click();
  await expect(page.locator("[data-pmf-hidden]")).toHaveCount(4);
  await expect(page.locator(".item-event__content")).toHaveCount(0);
  expect(await ordenVisual(page)).toEqual(["bac", "dij", "bae", "zzz"]);
  for (const id of ["bac", "dij", "bae", "zzz"]) await ojo(page, id).click();
  await expect(page.locator("[data-pmf-hidden]")).toHaveCount(0);
  await expect(page.locator(".item-event__content")).toHaveCount(4);
});
