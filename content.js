(() => {
  "use strict";

  const STORAGE_KEY = "promiedos-focus:hidden-leagues:v1";
  // CSS Modules changes the hash on deployment, but preserves these component names.
  const moduleClass = (name) => `:is([class^="${name}__"], [class*=" ${name}__"])`;
  const selectors = {
    card: moduleClass("match-info_itemevent"),
    header: moduleClass("event-header_button"),
    title: moduleClass("event-header_left"),
    controls: moduleClass("event-header_right"),
    content: ":scope > .item-event__content",
    collapse: "button:has(svg.lucide-chevron-down)",
    bell: "button:has(svg.lucide-bell, svg.lucide-bell-off)",
  };
  const records = new WeakMap();
  const nativeClicks = new WeakSet();
  let hiddenIds = readPreferences();
  let scheduled = false;
  let noticeTimeout;
  let focusAfterUpdate = null;

  function readPreferences() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return new Set(Array.isArray(value)
        ? value.filter((id) => typeof id === "string" && /^[a-zA-Z0-9_-]+$/.test(id))
        : []);
    } catch {
      return new Set();
    }
  }

  function showStorageError() {
    let notice = document.getElementById("pmf-storage-notice");
    if (!notice) {
      notice = document.createElement("div");
      notice.id = "pmf-storage-notice";
      notice.setAttribute("role", "status");
      document.body.append(notice);
    }
    notice.textContent = "No se pudo guardar la preferencia. Permití el almacenamiento de Promiedos y volvé a intentar.";
    clearTimeout(noticeTimeout);
    noticeTimeout = setTimeout(() => notice.remove(), 7000);
  }

  function leagueId(header) {
    const link = header.querySelector('a[href*="/league/"]');
    const image = header.querySelector('img[src*="/images/league/"]');
    for (const [value, pattern] of [
      [link?.getAttribute("href"), /^\/league\/[^/]+\/([a-zA-Z0-9_-]+)\/?$/],
      [image?.getAttribute("src"), /^\/images\/league\/([a-zA-Z0-9_-]+)\//],
    ]) {
      if (!value) continue;
      try {
        const match = new URL(value, location.origin).pathname.match(pattern);
        if (match) return match[1];
      } catch {
        // A missing or malformed identifier must not hide an unrelated competition.
      }
    }
    return null;
  }

  function createEye() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    for (const [key, value] of Object.entries({
      viewBox: "0 0 24 24", width: "18", height: "18", fill: "none",
      stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round",
      "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false",
    })) svg.setAttribute(key, value);
    for (const [tag, attrs] of [
      ["path", { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" }],
      ["circle", { cx: "12", cy: "12", r: "3" }],
      ["path", { d: "m3 3 18 18", class: "pmf-eye-slash" }],
    ]) {
      const child = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attrs)) child.setAttribute(key, value);
      svg.append(child);
    }
    return svg;
  }

  function createToggle(card) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pmf-toggle";
    button.append(createEye());
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const record = records.get(card);
      if (!record) return;
      // Read again so a recent change in another tab is preserved.
      const next = readPreferences();
      if (next.has(record.id)) next.delete(record.id);
      else next.add(record.id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next].sort()));
      } catch {
        showStorageError();
        return;
      }
      hiddenIds = next;
      focusAfterUpdate = button;
      reconcile();
    });
    return button;
  }

  function observe() {
    observer.observe(document.body, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ["class", "href", "src"],
    });
  }

  function reconcile() {
    scheduled = false;
    // Ignore our own attributes/buttons, then observe React's response to native clicks.
    observer.disconnect();
    const clicks = [];
    try {
      for (const card of document.querySelectorAll(selectors.card)) {
        const header = card.querySelector(`:scope > ${selectors.header}`);
        const controls = header?.querySelector(selectors.controls);
        const collapse = controls?.querySelector(selectors.collapse);
        if (!header || !controls || !collapse) continue;

        const previous = records.get(card);
        const id = leagueId(header);
        if (!id) continue;
        const hidden = hiddenIds.has(id);
        const name = header.querySelector(selectors.title)?.textContent.trim() || "esta competición";
        const button = previous?.button || createToggle(card);
        const anchor = controls.querySelector(selectors.bell)?.nextSibling || collapse;
        if (button.parentElement !== controls || button.nextSibling !== collapse) {
          controls.insertBefore(button, anchor === button ? collapse : anchor);
        }
        button.setAttribute("aria-pressed", String(hidden));
        button.setAttribute("aria-label", `Ocultar ${name}`);
        button.title = hidden
          ? `Mostrar ${name} y devolverla a su lugar`
          : `Ocultar ${name}: colapsar y mover al final`;
        card.setAttribute("data-pmf-league", id);
        card.toggleAttribute("data-pmf-hidden", hidden);
        // Promiedos already renders these cards as direct children of .flex-12.
        // CSS order keeps React's nodes in place and preserves the site's live updates.
        card.parentElement.setAttribute("data-pmf-list", "");
        records.set(card, { id, hidden, button });

        const expanded = !!card.querySelector(selectors.content);
        const restoring = previous?.id === id && previous.hidden && !hidden;
        if ((hidden && expanded) || (restoring && !expanded)) clicks.push(collapse);
      }
    } finally {
      observe();
    }
    for (const button of clicks) {
      if (!button.isConnected) continue;
      nativeClicks.add(button);
      button.click();
      nativeClicks.delete(button);
    }
    if (focusAfterUpdate?.isConnected) {
      focusAfterUpdate.focus({ preventScroll: true });
      focusAfterUpdate = null;
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(reconcile);
  }

  const observer = new MutationObserver(schedule);
  // A hidden competition stays collapsed until its eye is switched back on.
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest(selectors.collapse);
    if (button && !nativeClicks.has(button) && button.closest("[data-pmf-hidden]")) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  window.addEventListener("storage", (event) => {
    if (event.storageArea === localStorage && (event.key === STORAGE_KEY || event.key === null)) {
      hiddenIds = readPreferences();
      schedule();
    }
  });
  window.addEventListener("pageshow", () => {
    hiddenIds = readPreferences();
    schedule();
  });
  reconcile();
})();
