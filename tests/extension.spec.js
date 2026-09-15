const { test: base, expect, chromium } = require("@playwright/test");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");

const extension = path.resolve(__dirname, "..");
const origin = "https://www.promiedos.com.ar";
const storageKey = "promiedos-focus:hidden-leagues:v1";
const card = (page, id) => page.locator(`[data-pmf-league="${id}"]`);
const eye = (page, id) => card(page, id).locator(".pmf-toggle");

const test = base.extend({
  context: async ({}, use) => {
    const profile = await fs.mkdtemp(path.join(os.tmpdir(), "promiedos-test-"));
    const context = await chromium.launchPersistentContext(profile, {
      channel: "chromium", headless: true,
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, "--no-sandbox"],
    });
    const fixture = await fs.readFile(path.join(__dirname, "fixtures/promiedos.html"), "utf8");
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      return url.origin === origin
        ? route.fulfill({ contentType: "text/html", body: fixture })
        : route.fulfill({ status: 200, body: "" });
    });
    try { await use(context); }
    finally { await context.close(); await fs.rm(profile, { recursive: true, force: true }); }
  },
});

async function open(page, pathname = "/") {
  await page.goto(origin + pathname);
  await expect(page.locator(".pmf-toggle")).toHaveCount(4);
}

async function visualOrder(page) {
  return page.locator("[data-pmf-league]").evaluateAll((cards) => cards
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
    .map((element) => element.dataset.pmfLeague));
}

test("colapsa con el botón nativo, ordena al final y restaura sin tocar las campanas", async ({ page }) => {
  await open(page);
  await eye(page, "bac").click();
  await eye(page, "bae").click();
  await expect(card(page, "bac").locator(".item-event__content")).toHaveCount(0);
  await expect(card(page, "bae").locator(".item-event__content")).toHaveCount(0);
  await expect(eye(page, "bac")).toHaveAttribute("aria-pressed", "true");
  expect(await visualOrder(page)).toEqual(["dij", "zzz", "bac", "bae"]);
  expect(await page.evaluate(() => window.nativeClicks)).toEqual({ collapse: 2, sound: 0 });
  // Native DOM order stays intact for the site's React reconciliation.
  expect(await page.locator("[data-pmf-league]").evaluateAll((cards) => cards.map((c) => c.dataset.pmfLeague)))
    .toEqual(["bac", "dij", "bae", "zzz"]);
  await card(page, "bac").locator('[data-native="collapse"]').click();
  await expect(card(page, "bac").locator(".item-event__content")).toHaveCount(0);
  await eye(page, "bac").click();
  await expect(card(page, "bac").locator(".item-event__content")).toHaveCount(1);
  expect(await visualOrder(page)).toEqual(["bac", "dij", "zzz", "bae"]);
  // Ordinary manual collapse still works and does not change preferences.
  await card(page, "dij").locator('[data-native="collapse"]').click();
  await expect(card(page, "dij").locator(".item-event__content")).toHaveCount(0);
  await expect(eye(page, "dij")).toHaveAttribute("aria-pressed", "false");
  await expect(eye(page, "zzz")).toHaveAttribute("aria-pressed", "false");
});

test("persiste por ID al recargar y cambiar de fecha; sincroniza pestañas y borrado", async ({ page, context }) => {
  await open(page);
  await eye(page, "bae").click();
  await page.reload();
  await expect(eye(page, "bae")).toHaveAttribute("aria-pressed", "true");
  const other = await context.newPage();
  await open(other, "/games/16-09-2026");
  await expect(eye(other, "bae")).toHaveAttribute("aria-pressed", "true");
  await eye(other, "bac").click();
  await expect(eye(page, "bac")).toHaveAttribute("aria-pressed", "true");
  await eye(page, "bae").click();
  await expect(eye(other, "bae")).toHaveAttribute("aria-pressed", "false");
  await expect(card(other, "bae").locator(".item-event__content")).toHaveCount(1);
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey)).toEqual(["bac"]);
  await other.evaluate(() => localStorage.clear());
  await expect(page.locator("[data-pmf-hidden]")).toHaveCount(0);
  await expect(card(page, "bac").locator(".item-event__content")).toHaveCount(1);
});

test("reaplica las preferencias al filtrar y al reemplazar bloques sin duplicar botones", async ({ page }) => {
  await open(page);
  await eye(page, "bac").click();
  await page.evaluate(() => window.fixture.render([{ id: "dij", name: "Sudamericana" }]));
  await expect(page.locator(".pmf-toggle")).toHaveCount(1);
  await page.evaluate(() => window.fixture.render());
  await expect(page.locator(".pmf-toggle")).toHaveCount(4);
  await expect(card(page, "bac").locator(".item-event__content")).toHaveCount(0);
  await page.evaluate(() => window.fixture.soundOff());
  await expect(page.locator(".pmf-toggle")).toHaveCount(4);
  await expect(card(page, "bac").locator(".item-event__content")).toHaveCount(0);
  await page.evaluate(() => { document.querySelector('.score').textContent = '2 - 1'; });
  await expect(page.locator(".score").first()).toHaveText("2 - 1");
  expect(await page.evaluate(() => window.nativeClicks)).toEqual({ collapse: 2, sound: 0 });
});

test("oculta cuotas y banners dinámicos con su espacio; conserva otros avisos", async ({ page }) => {
  await open(page);
  await page.evaluate(() => window.fixture.addBanners());
  await expect(page.locator("#betting-banner")).toBeHidden();
  await expect(page.locator("#single-banner")).toBeHidden();
  await expect(page.locator("#leagues")).toBeVisible();
  await expect(page.locator('[class*="greencuotas__"]')).toBeHidden();
  await expect(page.locator(".promotions")).toBeHidden();
  await expect(page.locator(".match-block__cof").first()).toBeHidden();
  await expect(page.locator('[class*="styles_badge__newhash"]')).toBeHidden();
  await expect(page.locator("#unrelated-badge")).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
  await eye(page, "bac").focus();
  await page.keyboard.press("Space");
  await expect(eye(page, "bac")).toHaveAttribute("aria-pressed", "true");
  await expect(eye(page, "bac")).toBeFocused();
});

test("tolera preferencias inválidas y permite ocultar todas las competiciones", async ({ page, context }) => {
  await context.addInitScript((key) => localStorage.setItem(key, "{invalid json"), storageKey);
  await open(page);
  for (const id of ["bac", "dij", "bae", "zzz"]) await eye(page, id).click();
  await expect(page.locator("[data-pmf-hidden]")).toHaveCount(4);
  await expect(page.locator(".item-event__content")).toHaveCount(0);
  expect(await visualOrder(page)).toEqual(["bac", "dij", "bae", "zzz"]);
  for (const id of ["bac", "dij", "bae", "zzz"]) await eye(page, id).click();
  await expect(page.locator("[data-pmf-hidden]")).toHaveCount(0);
  await expect(page.locator(".item-event__content")).toHaveCount(4);
});
