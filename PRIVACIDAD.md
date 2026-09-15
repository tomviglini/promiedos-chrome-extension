# Política de privacidad de Promiedos Plus

Última actualización: 15 de septiembre de 2026.

## Finalidad

Promiedos Plus permite personalizar la visualización de Promiedos, ordenar competiciones y ocultar elementos de apuestas y el encabezado principal.

## Datos procesados en tu navegador

Para reconocer y ordenar los bloques, la extensión lee localmente los nombres y los identificadores de las competiciones presentes en la página, a partir de sus títulos, enlaces y direcciones de imágenes. Usa esa información para agregar los botones de visibilidad y aplicar la presentación elegida. No guarda copias de las páginas ni un historial de los sitios visitados.

También procesa los clics necesarios para ocultar, restaurar y mantener colapsadas las competiciones. Conserva únicamente la selección actual de competiciones ocultas: no registra una secuencia de clics, horarios de uso, movimientos del mouse, desplazamientos ni pulsaciones de teclado.

## Datos almacenados y conservación

La extensión guarda únicamente una lista de identificadores de las competiciones que decidís ocultar. Esta lista se almacena en el `localStorage` del sitio Promiedos, bajo la clave `promiedos-focus:hidden-leagues:v1`.

Se conserva el nombre histórico de esa clave para mantener la compatibilidad con versiones anteriores. No contiene nombres, correos, contraseñas ni información de pago.

Los datos leídos de la página se usan durante su visualización. La lista de preferencias permanece en ese navegador hasta que quites las competiciones de la selección o borres el almacenamiento correspondiente. La extensión no sincroniza esta lista con cuentas ni con otros dispositivos.

## Transmisión y acceso

Promiedos Plus no envía a servidores el contenido que procesa ni la lista de preferencias. No incluye herramientas de análisis de uso, no vende ni transmite los datos a terceros y tampoco consulta servicios externos para funcionar. El desarrollador no recibe estos datos.

El almacenamiento pertenece al origen de Promiedos y puede ser leído por los scripts que ejecuta ese sitio. La navegación en Promiedos y sus solicitudes de red se rigen por las políticas del propio sitio; ocultar un anuncio visualmente no impide que el sitio lo solicite.

## Uso limitado

La extensión utiliza esos datos exclusivamente para personalizar la visualización de Promiedos. No los utiliza para publicidad, perfiles comerciales, finalidades ajenas a esa función ni para determinar solvencia crediticia o conceder préstamos. Este uso se ajusta a la [política de datos de usuarios de Chrome Web Store](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), incluidos sus requisitos de uso limitado.

## Permisos

La extensión modifica el contenido de las páginas HTTPS de `www.promiedos.com.ar` y `promiedos.com.ar`. No solicita acceso al historial, contactos, ubicación ni otras páginas.

## Eliminación

Podés quitar competiciones de la lista volviendo a pulsar sus ojos. Para eliminar todas las preferencias, borrá los datos de Promiedos desde Chrome. Esto también elimina otros datos que el sitio guarde en tu navegador.

Desinstalar la extensión no elimina automáticamente los datos almacenados por el origen de Promiedos.

## Contacto

Para consultas, usá el [repositorio de Promiedos Plus](https://github.com/tomviglini/promiedos-chrome-extension).
