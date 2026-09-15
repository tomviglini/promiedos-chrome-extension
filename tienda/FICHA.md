# Textos para Chrome Web Store

## Nombre

Promiedos Plus

## Resumen

Personalizá Promiedos: colapsá competiciones al final y ocultá apuestas y el encabezado principal.

## Descripción

Concentrate en las competiciones que te interesan cuando visitás Promiedos.

Promiedos Plus agrega un ojo junto a la campanita de cada competición. Pulsalo para colapsar esa competición y dejarla al final de la lista. Su título queda visible y podés recuperarla en cualquier momento con otro clic.

La extensión recuerda tu selección al recargar, cambiar de fecha o cerrar Chrome. También oculta las cuotas, los avisos y banners de apuestas, y el encabezado principal del sitio.

Los enlaces del título y de la parte inferior de cada competición siguen disponibles. No necesitás una cuenta ni configurar un panel: se maneja desde los ojos de cada bloque.

Para aplicar estos cambios, la extensión lee localmente los títulos e identificadores de las competiciones y procesa tus clics en sus controles de visibilidad. Guarda únicamente tu selección actual en el navegador: no registra un historial de navegación o de clics ni envía esos datos a servidores. Oculta las apuestas visualmente; no bloquea las solicitudes de red del sitio.

Proyecto independiente, sin afiliación con Promiedos.

El código de la extensión es abierto y se distribuye bajo licencia MIT.
Código fuente y contribuciones: https://github.com/tomviglini/promiedos-chrome-extension

## Enlaces de la ficha

- **Homepage URL:** https://github.com/tomviglini/promiedos-chrome-extension
- **Support URL:** https://github.com/tomviglini/promiedos-chrome-extension/issues
- **Política de privacidad:** https://github.com/tomviglini/promiedos-chrome-extension/blob/main/PRIVACIDAD.md

Antes de enviar la ficha, comprobá que el repositorio sea público y que estos enlaces se puedan abrir sin iniciar sesión.

## Propósito único

Personalizar la visualización de Promiedos para priorizar las competiciones que le interesan al usuario. Permite colapsar las competiciones elegidas y moverlas al final de la lista mediante un botón junto a la campanita, recordar esa selección en el navegador y ocultar los elementos de apuestas y el encabezado principal.

## Formulario Privacy

Las siguientes respuestas describen la versión 1.0.0. Revisalas si cambia el comportamiento de la extensión.

### Single purpose description

Copiá el texto de «Propósito único» de este documento.

### Host permission justification

El acceso a https://www.promiedos.com.ar/* y https://promiedos.com.ar/* permite ejecutar el JavaScript y los estilos incluidos en la extensión sobre Promiedos. Se necesita para identificar los bloques de competiciones, agregar el botón de visibilidad junto a la campanita, accionar el colapsado existente, mover los bloques seleccionados al final y ocultar los elementos de apuestas y el encabezado principal. La selección se guarda en el localStorage de Promiedos y se reaplica al cargar o actualizar la página. El acceso se limita a esos dos dominios HTTPS y los datos procesados no se envían a servidores.

### Are you using remote code?

Seleccioná **No, I am not using Remote code**. Si queda habilitado el campo de justificación, podés usar:

Todo el JavaScript y los estilos ejecutados por la extensión están incluidos en su paquete. La extensión no descarga ni ejecuta JavaScript o WebAssembly externos, no importa módulos remotos ni utiliza eval() para ejecutar código.

### Data usage

Google requiere declarar el tratamiento de datos incluso cuando ocurre únicamente en el dispositivo. La siguiente correspondencia entre el código y las categorías del formulario es la recomendación para esta versión; no significa que el desarrollador reciba esos datos. [Preguntas frecuentes oficiales, preguntas 2 a 4](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq).

| Categoría | Selección recomendada | Alcance en esta extensión |
| --- | --- | --- |
| Website content | Marcar | Lee localmente títulos, enlaces y direcciones de imágenes para identificar las competiciones y modificar su presentación. |
| User activity | Marcar | Procesa las acciones de ocultar o restaurar competiciones y conserva la selección actual. No registra un historial de clics ni realiza seguimiento del uso. |
| Personally identifiable information | No marcar | No trata datos de identidad del usuario. |
| Health information | No marcar | No trata información de salud. |
| Financial and payment information | No marcar | No trata datos financieros o de pago del usuario. Ocultar apuestas no implica recopilar transacciones. |
| Authentication information | No marcar | No lee credenciales ni cookies de autenticación. |
| Personal communications | No marcar | No trata comunicaciones personales. |
| Location | No marcar | No obtiene la ubicación del usuario. |
| Web history | No marcar | No recopila una lista de páginas visitadas ni sus fechas. |

Marcá las tres certificaciones: la extensión no vende ni transmite datos a terceros, no los utiliza para fines ajenos a su propósito único y no los utiliza para determinar solvencia crediticia o conceder préstamos.

### Privacy policy URL

https://github.com/tomviglini/promiedos-chrome-extension/blob/main/PRIVACIDAD.md

La política pública debe coincidir con estas declaraciones. Si modificaste el archivo local, publicá la actualización en GitHub antes de enviar el formulario.

## Instrucciones para revisión

1. Abrir https://www.promiedos.com.ar/ y esperar a que carguen los partidos.
2. Pulsar el ojo junto a la campanita de una competición: debe quedar colapsada al final de la lista.
3. Recargar: la selección debe conservarse.
4. Volver a pulsar el ojo: la competición debe expandirse y regresar a su posición.
5. Verificar que se ocultan las apuestas y el encabezado principal; los filtros y enlaces de las competiciones permanecen disponibles.

No requiere inicio de sesión. Si no hay partidos en la fecha actual, se puede elegir otra fecha desde el calendario de Promiedos.
