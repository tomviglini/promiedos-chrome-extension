# Publicar Promiedos Plus en Chrome Web Store

## Qué significa pasarla a producción

La extensión ya funciona al cargarla manualmente. Para que otras personas puedan instalarla desde un enlace de Chrome Web Store y recibir actualizaciones automáticas, hay que publicar una ficha en esa tienda. No necesita servidor ni base de datos externos.

Subir el código a GitHub no publica automáticamente la extensión en Chrome Web Store.

## Distribuir el ZIP desde GitHub

Los [releases del repositorio](https://github.com/tomviglini/promiedos-chrome-extension/releases) incluyen el ZIP listo para instalar manualmente. Contiene una carpeta `promiedos-plus-VERSIÓN/`, de modo que **Extraer aquí** agrupa los archivos dentro de ella. El flujo `.github/workflows/release.yml` genera y adjunta este ZIP automáticamente al subir una etiqueta que coincida con la versión del manifiesto.

Para una versión futura, después de actualizar el número, probar y subir el código:

```sh
git tag -a v1.0.2 -m "Promiedos Plus 1.0.2"
git push origin v1.0.2
```

GitHub Actions crea el release, adjunta el ZIP y comprueba que se pueda descargar. Si el release ya existe, reemplaza el ZIP del mismo nombre y actualiza las notas de instalación. Sus resultados también se guardan en `refs/notes/releases`, sin modificar los archivos de la rama principal. La visibilidad de las descargas depende de la visibilidad y los permisos del repositorio.

Si la etiqueta ya existe, también se puede publicar o actualizar su release manualmente:

1. Abrí [Actions → Publicar release](https://github.com/tomviglini/promiedos-chrome-extension/actions/workflows/release.yml).
2. Pulsá **Run workflow**, dejá seleccionada la rama `main` e ingresá la etiqueta, por ejemplo `v1.0.1`.
3. Pulsá **Run workflow** y esperá a que termine. El paquete se genera con el código de esa etiqueta.

GitHub Actions debe estar habilitado en el repositorio. Tanto la publicación automática como la manual generan el paquete con el código y el empaquetador de la etiqueta seleccionada. Ejecutar el flujo manualmente no cambia la etiqueta.

## 1. Crear la cuenta de desarrollador

Entrá al [panel de desarrolladores](https://chrome.google.com/webstore/devconsole), registrá una cuenta y completá los datos que solicite Google. El registro requiere un pago único; el panel muestra el importe aplicable. [Registro oficial](https://developer.chrome.com/docs/webstore/register).

## 2. Preparar y subir el paquete

```sh
npm ci
npx playwright install chromium
npm test
npm run package
```

Se generan el ZIP para instalación manual y `dist/promiedos-plus-1.0.1-chrome-web-store.zip`. En el panel, elegí **Agregar nuevo elemento**, seleccioná el archivo terminado en `-chrome-web-store.zip` y subilo. Ese paquete tiene `manifest.json` en la raíz del ZIP, como requiere la tienda. [Preparación del paquete](https://developer.chrome.com/docs/webstore/prepare).

## 3. Completar la ficha

- **Nombre:** Promiedos Plus.
- **Idioma:** español.
- **Resumen:** Personalizá Promiedos: colapsá competiciones al final y ocultá apuestas y el encabezado de escritorio.
- **Descripción y propósito único:** usá los textos de [tienda/FICHA.md](tienda/FICHA.md).
- **Icono:** `icons/icon-128.png`.
- **Imagen promocional:** `tienda/promocion-440x280.png`.
- **Captura de pantalla:** `tienda/captura-1280x800.png`.
- **Homepage URL:** https://github.com/tomviglini/promiedos-chrome-extension
- **Support URL:** https://github.com/tomviglini/promiedos-chrome-extension/issues
- **Política de privacidad:** https://github.com/tomviglini/promiedos-chrome-extension/blob/main/PRIVACIDAD.md

Estos enlaces requieren que el repositorio sea público. Comprobá que puedan abrirse sin iniciar sesión antes de enviar la ficha. El código se distribuye bajo licencia MIT y ambos ZIP incluyen el archivo `LICENSE`.

Chrome Web Store pide un icono de 128 × 128, una imagen promocional pequeña de 440 × 280 y al menos una captura. Los archivos incluidos están preparados para esos campos. [Requisitos de imágenes](https://developer.chrome.com/docs/webstore/images).

La ficha describe a Promiedos Plus como un proyecto independiente. El icono utiliza la pelota verde como referencia y un signo más propio para distinguirlo.

## 4. Privacidad y distribución

Declarar que la extensión personaliza exclusivamente Promiedos. Lee localmente el contenido necesario para identificar las competiciones, procesa sus controles de visibilidad y guarda los IDs de las competiciones ocultas en el navegador. No transmite esos datos ni ejecuta código remoto. No tiene permisos adicionales declarados; sus scripts se limitan a los dos dominios HTTPS indicados en el manifiesto.

Completá el formulario con los textos y las categorías de [Formulario Privacy](tienda/FICHA.md#formulario-privacy). El tratamiento local también debe declararse; la ausencia de envíos a servidores no basta para omitirlo. Asegurate de que la versión pública de la política esté actualizada antes de enviar la ficha.

Elegí la distribución **pública** o **no listada**: la segunda permite instalar mediante el enlace sin aparecer en las búsquedas de la tienda. Ambas requieren revisión. [Opciones de distribución](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution).

## 5. Enviar a revisión

Enviá la extensión a revisión. Podés elegir que se publique al aprobarse o reservar la publicación manual. Los tiempos de revisión dependen del caso; tener un ZIP válido no implica aprobación automática. [Proceso de publicación](https://developer.chrome.com/docs/webstore/publish).

El registro de la cuenta, el pago y el envío a revisión se hacen desde tu cuenta de Google. Este repositorio contiene el paquete y los materiales, pero no implica que la extensión ya esté publicada.

## Actualizaciones

1. Hacé los cambios y ejecutá las pruebas.
2. Incrementá la versión en `manifest.json`, `package.json` y `package-lock.json`; por ejemplo, de `1.0.1` a `1.0.2`.
3. Generá los paquetes con `npm run package` y elegí el ZIP terminado en `-chrome-web-store.zip`.
4. Subilo como actualización del mismo elemento de Chrome Web Store y envialo a revisión.

Cada actualización debe tener una versión mayor a la anterior. Chrome distribuye las actualizaciones publicadas a quienes instalaron desde la tienda. [Actualizar un elemento](https://developer.chrome.com/docs/webstore/update).
