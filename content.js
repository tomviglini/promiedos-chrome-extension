(() => {
  "use strict";

  const CLAVE_ALMACENAMIENTO = "promiedos-focus:hidden-leagues:v1";
  // CSS Modules cambia el hash en cada despliegue, pero conserva estos nombres de componente.
  const claseDeModulo = (nombre) => `:is([class^="${nombre}__"], [class*=" ${nombre}__"])`;
  const selectores = {
    tarjeta: claseDeModulo("match-info_itemevent"),
    encabezado: claseDeModulo("event-header_button"),
    titulo: claseDeModulo("event-header_left"),
    controles: claseDeModulo("event-header_right"),
    contenido: ":scope > .item-event__content",
    colapsar: "button:has(svg.lucide-chevron-down)",
    campana: "button:has(svg.lucide-bell, svg.lucide-bell-off)",
  };
  const registros = new WeakMap();
  const clicsNativos = new WeakSet();
  let idsOcultos = leerPreferencias();
  let programado = false;
  let temporizadorAviso;
  let focoTrasActualizar = null;

  function leerPreferencias() {
    try {
      const valor = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO) || "[]");
      return new Set(Array.isArray(valor)
        ? valor.filter((id) => typeof id === "string" && /^[a-zA-Z0-9_-]+$/.test(id))
        : []);
    } catch {
      return new Set();
    }
  }

  function mostrarErrorDeAlmacenamiento() {
    let aviso = document.getElementById("pmf-storage-notice");
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.id = "pmf-storage-notice";
      aviso.setAttribute("role", "status");
      document.body.append(aviso);
    }
    aviso.textContent = "No se pudo guardar la preferencia. Permití el almacenamiento de Promiedos y volvé a intentar.";
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => aviso.remove(), 7000);
  }

  function idDeCompeticion(encabezado) {
    const enlace = encabezado.querySelector('a[href*="/league/"]');
    const imagen = encabezado.querySelector('img[src*="/images/league/"]');
    for (const [valor, patron] of [
      [enlace?.getAttribute("href"), /^\/league\/[^/]+\/([a-zA-Z0-9_-]+)\/?$/],
      [imagen?.getAttribute("src"), /^\/images\/league\/([a-zA-Z0-9_-]+)\//],
    ]) {
      if (!valor) continue;
      try {
        const coincidencia = new URL(valor, location.origin).pathname.match(patron);
        if (coincidencia) return coincidencia[1];
      } catch {
        // Un identificador ausente o mal formado no debe ocultar otra competición.
      }
    }
    return null;
  }

  function crearOjo() {
    const espacioSvg = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(espacioSvg, "svg");
    for (const [clave, valor] of Object.entries({
      viewBox: "0 0 24 24", width: "18", height: "18", fill: "none",
      stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round",
      "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false",
    })) svg.setAttribute(clave, valor);
    for (const [etiqueta, atributos] of [
      ["path", { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" }],
      ["circle", { cx: "12", cy: "12", r: "3" }],
      ["path", { d: "m3 3 18 18", class: "pmf-eye-slash" }],
    ]) {
      const hijo = document.createElementNS(espacioSvg, etiqueta);
      for (const [clave, valor] of Object.entries(atributos)) hijo.setAttribute(clave, valor);
      svg.append(hijo);
    }
    return svg;
  }

  function crearBoton(tarjeta) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "pmf-toggle";
    boton.append(crearOjo());
    boton.addEventListener("click", (evento) => {
      evento.preventDefault();
      evento.stopPropagation();
      const registro = registros.get(tarjeta);
      if (!registro) return;
      // Se vuelve a leer para conservar un cambio reciente hecho en otra pestaña.
      const siguientes = leerPreferencias();
      if (siguientes.has(registro.id)) siguientes.delete(registro.id);
      else siguientes.add(registro.id);
      try {
        localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify([...siguientes].sort()));
      } catch {
        mostrarErrorDeAlmacenamiento();
        return;
      }
      idsOcultos = siguientes;
      focoTrasActualizar = boton;
      reconciliar();
    });
    return boton;
  }

  function observar() {
    observador.observe(document.body, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ["class", "href", "src"],
    });
  }

  function reconciliar() {
    programado = false;
    // Ignora nuestros propios atributos y botones; después observa cómo responde React a los clics nativos.
    observador.disconnect();
    const clics = [];
    try {
      for (const tarjeta of document.querySelectorAll(selectores.tarjeta)) {
        const encabezado = tarjeta.querySelector(`:scope > ${selectores.encabezado}`);
        const controles = encabezado?.querySelector(selectores.controles);
        const colapsar = controles?.querySelector(selectores.colapsar);
        if (!encabezado || !controles || !colapsar) continue;

        const anterior = registros.get(tarjeta);
        const id = idDeCompeticion(encabezado);
        if (!id) continue;
        const oculta = idsOcultos.has(id);
        const nombre = encabezado.querySelector(selectores.titulo)?.textContent.trim() || "esta competición";
        const boton = anterior?.boton || crearBoton(tarjeta);
        const ancla = controles.querySelector(selectores.campana)?.nextSibling || colapsar;
        if (boton.parentElement !== controles || boton.nextSibling !== colapsar) {
          controles.insertBefore(boton, ancla === boton ? colapsar : ancla);
        }
        boton.setAttribute("aria-pressed", String(oculta));
        boton.setAttribute("aria-label", `Ocultar ${nombre}`);
        boton.title = oculta
          ? `Mostrar ${nombre} y devolverla a su lugar`
          : `Ocultar ${nombre}: colapsar y mover al final`;
        tarjeta.setAttribute("data-pmf-league", id);
        tarjeta.toggleAttribute("data-pmf-hidden", oculta);
        // Promiedos ya muestra estas tarjetas como hijas directas de .flex-12.
        // El orden por CSS deja los nodos de React en su lugar y conserva las actualizaciones en vivo del sitio.
        tarjeta.parentElement.setAttribute("data-pmf-list", "");
        registros.set(tarjeta, { id, oculta, boton });

        const expandida = !!tarjeta.querySelector(selectores.contenido);
        const restaurando = anterior?.id === id && anterior.oculta && !oculta;
        if ((oculta && expandida) || (restaurando && !expandida)) clics.push(colapsar);
      }
    } finally {
      observar();
    }
    for (const boton of clics) {
      if (!boton.isConnected) continue;
      clicsNativos.add(boton);
      boton.click();
      clicsNativos.delete(boton);
    }
    if (focoTrasActualizar?.isConnected) {
      focoTrasActualizar.focus({ preventScroll: true });
      focoTrasActualizar = null;
    }
  }

  function programar() {
    if (programado) return;
    programado = true;
    requestAnimationFrame(reconciliar);
  }

  const observador = new MutationObserver(programar);
  // Una competición oculta sigue colapsada hasta que se vuelve a activar su ojo.
  document.addEventListener("click", (evento) => {
    if (!(evento.target instanceof Element)) return;
    const boton = evento.target.closest(selectores.colapsar);
    if (boton && !clicsNativos.has(boton) && boton.closest("[data-pmf-hidden]")) {
      evento.preventDefault();
      evento.stopImmediatePropagation();
    }
  }, true);
  window.addEventListener("storage", (evento) => {
    if (evento.storageArea === localStorage && (evento.key === CLAVE_ALMACENAMIENTO || evento.key === null)) {
      idsOcultos = leerPreferencias();
      programar();
    }
  });
  window.addEventListener("pageshow", () => {
    idsOcultos = leerPreferencias();
    programar();
  });
  reconciliar();
})();
