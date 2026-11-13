# Checklist de mejoras · Auditoría tanda 1

Resultado de unir las cinco evaluaciones de [Auditoría-sitio-web.md](Auditoría-sitio-web.md) en una sola lista, sin duplicados. Cada mejora lleva un identificador (`US-01`, `AC-03`…). El mismo identificador aparece al principio del título de la tarea correspondiente en `plan/`, que tiene un hito por categoría y un hito M7 para las mejoras evolutivas (sección 6).

**Evaluadores:** C = Carlos · M = Miguel · J = Jorge · I = Iyán · S = Claude Sonnet 5.5

**Prioridad:**
- **Alta**: la métrica tiene una media inferior a 5, o al menos tres evaluadores señalan el problema.
- **Media**: la señalan uno o dos evaluadores y mejora una métrica que se puede medir.
- **Baja**: es opcional o mejora poco la puntuación.

## 1. Resumen de métricas

| Métrica | C | M | J | I | S | Media |
|---|---|---|---|---|---|---|
| 1.1 Comprensibilidad global | 7 | 8 | 10 | 8 | 5,5 | 7,7 |
| 1.2 Ayuda y retroalimentación | 4 | 3 | 8 | 0 | 2 | **3,4** |
| 1.3 Estética | 9 | 8 | 8 | 10 | 6 | 8,2 |
| 1.4 Adaptabilidad a móviles | 6 | 9 | 9 | 10 | 6,5 | 8,1 |
| 1.5 Internacionalización | 0 | 1 | 0 | 0 | 1 | **0,4** |
| 1.6 Redes sociales | 8 | 7 | 8 | 10 | 5 | 7,6 |
| 2.1 Solo teclado | 8 | 8 | 10 | 10 | 5 | 8,2 |
| 2.2 Sin elementos gráficos | 8 | 7 | 9 | 10 | 4,5 | 7,7 |
| 2.3 Accesibilidad automática | 10 | 10 | 10 | 10 | 3,5 | 8,7 |
| 3.1 Buscador | 0 | 0 | 0 | 0 | 0 | **0,0** |
| 3.2 Facilidad de navegación | 7 | 9 | 9 | 10 | 6 | 8,2 |
| 4.1 Aficiones | 6 | 4 | 9 | 10 | 5 | 6,8 |
| 4.2 Formación y experiencia | 8 | 7 | 8 | 10 | 6 | 7,8 |
| 4.3 Contacto | 9 | 8 | 10 | 10 | 6,5 | 8,7 |
| 4.4 Personas que avalan | 0 | 0 | 0 | 0 | 1 | **0,2** |
| 5.1 Ausencia de errores | 7 | 7 | 7 | 10 | 5,5 | 7,3 |
| 5.2 Validación HTML | 10 | 10 | 10 | 10 | 5 | 9,0 |
| 5.3 Validación CSS | 10 | 10 | 10 | 9,5 | 5 | 8,9 |
| 5.4 Fecha de última actualización | 2 | 3 | 0 | 0 | 2 | **1,4** |
| 6.1 Rendimiento | 7 | 6 | 6 | 8,66 | 6 | 6,7 |
| 6.2 Tiempo de carga | 6 | 4 | 1 | 8 | 7 | 5,2 |

Media por categoría: Usabilidad 5,9 · Accesibilidad 8,2 · Funcionalidad **4,1** · Contenidos 5,9 · Confiabilidad 6,7 · Eficiencia 6,0. Media global: 6,2.

Las cinco métricas en negrita (media inferior a 3,5) son 1.2, 1.5, 3.1, 4.4 y 5.4. Son las que más margen de mejora tienen. La 6.2 (5,2) es la más cara de arreglar, pero es la que más nota un visitante real.

## 2. Mejoras a implementar

### Usabilidad (hito M1)

- [x] **US-01** Numeración y etiquetas coherentes del carrusel
  - Alta · C, J · métricas 1.1, 1.2, 3.2, 5.1
  - Hoy los puntos dicen Inicio = «3 de 5», Sobre mí = 4, Proyectos = 5, Multimedia = 1 y Galería = 2. Pasar a Inicio = 1 … Galería = 5 en los 25 puntos de las 5 páginas.
- [x] **US-02** Migas de pan textuales («Inicio › Proyectos») en las 4 páginas interiores
  - Media · C, M, I, S · métrica 1.1
  - Hecho el 2026-11-12: `<nav class="breadcrumb" aria-label="Migas de pan">` con `<ol>` al principio del `<main>` de Sobre mí, Proyectos, Multimedia y Galería. La página actual lleva `aria-current="page"` y el separador › tiene `aria-hidden`.
- [x] **US-03** Página «Ayuda y mapa del sitio» enlazada desde el pie
  - Media · C, M, I, S · métricas 1.1, 1.2
  - Estructura del sitio, atajos de teclado y cómo contactar. Queda fuera del carrusel de 5 páginas. Se escribe después de FU-03, para documentar el comportamiento final.
  - Hecho el 2026-11-12: `ayuda.html` con mapa del sitio (las 5 páginas y sus secciones con enlaces), cómo moverse (menú, migas, carrusel, flechas laterales, bucle), atajos de teclado (← → y sus excepciones, Tab, «Saltar al contenido», Intro) y cómo contactar. Enlace «Ayuda y mapa del sitio» en el pie de las 6 páginas (`aria-current` en la propia ayuda). No lleva carrusel ni `main.js`. Tampoco lleva el script de Contentsquare: **Francisco decide si lo añade**.
- [x] **US-04** Anunciar el atajo de teclado ← → en la interfaz
  - Alta · C, M · métrica 1.2
  - Pista visible junto al carrusel y `aria-keyshortcuts` en los botones ‹ ›.
  - Hecho el 2026-11-12: «También puedes cambiar de página con las teclas ← y →» bajo el carrusel en las 5 páginas. Va con `hidden` en el HTML y la muestra `main.js`, que también pone `aria-keyshortcuts="ArrowLeft"`/`"ArrowRight"` en los enlaces ‹ ›: sin JavaScript no hay atajo y no se anuncia. Con `@media (hover: none)` (pantallas táctiles) no se muestra. Comprobado en el DOM final de Edge y con captura.
- [x] **US-05** Página 404 propia con botón para volver al inicio
  - Media · C, S · métrica 1.2
  - Hecho el 2026-11-12: `404.html` en la raíz, que GitHub Pages sirve sola, con `noindex`, explicación, botón «Volver al inicio» (`.button`, la misma clase que el botón del formulario), enlaces a las demás páginas y a la ayuda, y correo para avisar de enlaces rotos. Límite: usa rutas relativas, así que con una URL inexistente en una subcarpeta (`/webPersonal/a/b`) la página sale sin estilos. Funciona bien en el caso normal (`/webPersonal/loquesea.html`). La versión bilingüe está prevista en US-09 (T12).
- [x] **US-06** Formulario de contacto con mensaje de confirmación
  - Media · M, S, C · métricas 1.2, 4.3
  - **Decisión previa:** el sitio es estático. Hay que elegir entre un servicio externo (Formspree o Getform, con revisión de privacidad) y un formulario con `mailto:` más confirmación en página. Si no se quiere, se cancela la tarea.
  - Decidido por Francisco el 2026-11-12: FormSubmit (formsubmit.co).
  - Hecho el 2026-11-12: formulario «Escríbeme» en Inicio (nombre, correo y mensaje, con `label`, `autocomplete` y `required`), trampa `_honey` oculta y nota de privacidad. Sin JavaScript se envía de forma normal y FormSubmit muestra su confirmación (con captcha). Con JavaScript se envía a `formsubmit.co/ajax/…` y el resultado aparece en una región `role="status"` («Gracias, tu mensaje se ha enviado…» o un error con el correo como alternativa). Probado con `fetch` simulado (éxito y error); **no se ha hecho ningún envío real**. **Pendiente de Francisco:** tras el push, enviar un mensaje de prueba desde la web y confirmar el correo de activación que manda FormSubmit; sin ese paso no entrega nada. Está en el plan como tarea de revisión manual (T57, `#manual`). Opcional: cambiar el correo del `action` por el alias aleatorio que da FormSubmit tras la activación.
- [x] **US-07** Imágenes en Sobre mí y capturas en las tarjetas de Proyectos
  - Baja · S · métrica 1.3
  - Solo en WebP ligero, para no empeorar el rendimiento (EF-01).
  - Hecho el 2026-11-12 con las fotos de Francisco: en Sobre mí, la graduación («Mi historia»), el concurso de Empathy con WiChat («Intereses profesionales») y una fila con esquí y surf de la misma altura («Fuera del trabajo»). Son WebP de 37–55 KB (180 KB las 4), con `width`/`height`, `alt` descriptivo y pie de foto; todas cargan diferidas salvo la graduación. En Proyectos, capturas de las demos de TFG, WiChat y Outfitly sacadas de los pósters de los vídeos (los mismos ficheros que Multimedia); BasaltDB no tiene captura. Originales JPG en `C:\Code\webPersonal-originales\img\personal`. **Que revise Francisco:** los pies de foto «El día de la graduación del grado, en 2026» y «Con el equipo de WiChat en el concurso de Empathy» salen del nombre de los ficheros.
- [x] **US-08** Áreas táctiles de al menos 44×44 px
  - Media · S · métricas 1.4, 2.1
  - Aplica a los puntos del carrusel (hoy 12×12 px), el menú y los botones.
  - Hecho el 2026-11-12: los puntos miden 44×44 px y el punto visible de 12 px se dibuja con `::before`; los enlaces del menú y el nombre de la cabecera tienen 44 px de alto (la cabecera conserva su altura porque se reduce su relleno); los enlaces ‹ › del carrusel, 44 px de alto. Medido con un script en Edge a 1280 y 500 px: los 15 controles cumplen. Los enlaces dentro de un texto quedan fuera, porque WCAG 2.5.8 los exime.
- [x] **US-09** Versión en inglés con selector de idioma
  - Alta · C, M, J, I, S · métrica 1.5
  - Carpeta `/en/` con los mismos nombres de fichero, selector ES/EN en la cabecera, `<html lang="en">` y `hreflang`. Es la última tarea de contenido, para no traducir nada dos veces.
  - Hecho el 2026-11-12 (T10–T12):
    - **Páginas:** `en/` tiene las 5 páginas del recorrido y Ayuda, con los mismos nombres de fichero y `<html lang="en">`. Se han traducido textos, `alt`, `aria-label`, pies de foto, títulos y descripciones; comprobado con un script que busca restos en español. Lo que solo existe en español se dice: la transcripción del podcast queda en español con `lang="es"` («in Spanish» en el desplegable), el CV se enlaza con `hreflang="es"` y «in Spanish», y las referencias llevan «Translated from Spanish» además de «Pending confirmation». El asunto del correo del formulario sigue en español, porque lo lee Francisco, y añade «(versión en inglés)».
    - **Selector:** enlace «English»/«Español» en la cabecera de las 12 páginas, que lleva a la misma página en el otro idioma (`lang` y `hreflang` en el enlace, 44 px de alto). En escritorio va tras el menú, separado por una línea; en móvil, arriba a la derecha, sin añadir otra fila. Cada página declara `<link rel="alternate">` es, en y x-default con la URL absoluta de GitHub Pages. Ayuda lo explica.
    - **Script y 404:** `main.js` elige los textos del formulario según `<html lang>`; probado con un `fetch` simulado en los dos idiomas. El atajo ← → navega dentro de la misma carpeta. La 404, que GitHub Pages sirve en cualquier ruta inexistente, es bilingüe (bloque «Page not found» con `lang="en"` y botón a `en/index.html`) y usa rutas desde la raíz (`/webPersonal/…`). Así ya no pierde los estilos en rutas profundas como `/webPersonal/en/no/existe`, comprobado con un servidor local que imita a GitHub Pages. A cambio, abierta como fichero suelto (`file://`) sale sin estilos.
    - **Comprobado:** un script recorre las 13 páginas y da 389 enlaces internos y 0 rotos (anclas incluidas); las etiquetas están bien cerradas y Contentsquare está en todas. Capturas de Inicio en inglés y de la cabecera a 1280 y 500 px.
    - **Que revise Francisco:** la traducción, sobre todo cómo se nombran el grado («Bachelor's Degree in Software Engineering»), el máster («Master's Degree in Web Engineering») y la matrícula de honor («nominated for distinction»).
- [x] **US-10** Pie común con correo, GitHub y LinkedIn (iconos SVG con texto) en las 5 páginas
  - Media · S (C, M, J, I puntúan 1.6 entre 7 y 10) · métricas 1.6, 4.3
  - Cubre también «el bloque de contacto en todas las páginas». Otras redes solo si existen (M).
  - Hecho el 2026-11-12: lista `.footer-links` en el pie de las 5 páginas con Correo (`mailto:`), GitHub y LinkedIn; cada enlace lleva un icono SVG en línea con `aria-hidden` y `currentColor`, y texto visible. Áreas táctiles de 44 px de alto. No se añaden otras redes porque no constan.

### Accesibilidad (hito M2)

- [x] **AC-01** Enlace «Saltar al contenido» en las 5 páginas
  - Alta · M, S · métrica 2.1
- [x] **AC-02** Estilo `:focus-visible` propio y consistente
  - Media · S (C y M dan por válido el foco del navegador) · métrica 2.1
  - Hecho el 2026-11-12: regla global `:focus-visible` con anillo de 3 px en `--accent` (contraste 8,6:1), separado 2 px y con esquinas de 4 px. Los componentes con forma propia (puntos, enlaces ‹ ›) la conservan y el anillo la sigue. En las flechas laterales, pegadas al borde de la ventana, el anillo va hacia dentro. Comprobado con capturas del menú, un punto, un enlace ‹ › y una flecha lateral.
- [x] **AC-03** Atajo ← → seguro
  - Media · C · métrica 2.1
  - Ignorar el atajo con Alt/Ctrl/Mayús/Meta y cuando el foco esté en vídeo, audio o campos de texto. Hoy Alt+← (atrás del navegador) y las flechas sobre un `<video controls>` cambian de página.
  - Hecho el 2026-11-12: `main.js` ignora el atajo con Alt, Ctrl, Mayús o Meta, durante la composición de texto (IME) y con el foco en `input`, `textarea`, `select`, `video`, `audio`, `[contenteditable]` y los roles slider, listbox, menu y tablist. Probado en Edge con 12 casos (`defaultPrevented`): solo navega la flecha sin modificadores fuera de esos elementos.
- [x] **AC-04** Emojis decorativos con `aria-hidden`
  - Baja · S (en 1.3) · métricas 1.3, 2.2
  - Hecho el 2026-11-12: los 9 emojis del sitio (5 en «Actualmente» de Sobre mí y 4 en los títulos de las tarjetas de Proyectos) van dentro de `<span aria-hidden="true">`. Comprobado con un script que recorre las 7 páginas: no queda ninguno sin envolver.
- [x] **AC-05** Subtítulos y transcripción de los contenidos multimedia
  - Baja · S · métrica 2.2
  - Primero comprobar qué vídeos tienen audio. *(Comprobado en EF-02: ninguno de los 4 vídeos tiene audio; solo falta la transcripción del podcast.)* Subtítulos con `<track kind="captions">` (WebVTT) y transcripción del podcast en la página.
  - Hecho el 2026-11-12: subtítulos cancelados (T19), porque los vídeos no tienen audio. La transcripción del podcast (T20), aportada por Francisco en `assets/audio/tanscripción.txt`, está en Multimedia dentro de un `<details>` bajo el reproductor: 10 intervenciones («Voz 1», «Voz 2») y el título del artículo con `lang="en"`. El texto es el literal del fichero; tiene algunos errores de transcripción automática que Francisco puede corregir (por ejemplo «Hola. Por un nuevo análisis a fondo», «Se Variational…», «más de un 17 a»).
- [ ] **AC-06** Auditar las páginas ES y EN con Lighthouse, WAVE y axe, y resolver los avisos
  - Alta · J, S · métrica 2.3
  - J vio con WAVE un «posible encabezado» y un enlace repetido. Sospecha: `.site-brand` es un `<p>` con estilo de título. El enlace repetido se resuelve con FU-04.
- [ ] **AC-07** Prueba manual: solo teclado, lector de pantalla (NVDA) e imágenes/CSS desactivados
  - Media · C, M, J, I (método de prueba) · métricas 2.1, 2.2, 2.3
  - Dejar el resultado documentado.

### Funcionalidad (hito M3)

- [x] **FU-01** Buscador del sitio con Pagefind
  - Alta · C, M, J, I, S (los cinco dan 0) · métrica 3.1
  - Pagefind indexa en el workflow de Pages y funciona en GitHub Pages sin servidor. Caja de búsqueda accesible en la cabecera y página de resultados con `aria-live`. Va después de la versión en inglés, para indexar las dos lenguas y tocar la cabecera una sola vez.
  - Hecho el 2026-11-12 (T24–T26), **sin Pagefind:** Pagefind es una dependencia externa (un binario en el workflow y su JS en la web), y las reglas del proyecto no permiten añadirlas. El buscador es propio y tampoco necesita servidor.
    - **Índice:** `tools/build-search-index.py` (solo biblioteca estándar de Python) divide el `<main>` de las 12 páginas por sus apartados `<h2 id>` y escribe `assets/js/search-index.js` (26 KB, 20 apartados por idioma; se carga solo en la página Buscar). Ignora las migas y lo que lleva `aria-hidden`, e incluye los `alt`. El workflow de Pages lo regenera en cada despliegue; también está en el repositorio, para que funcione en local y con `file://`.
    - **Interfaz:** «Buscar», con lupa, en la cabecera de todas las páginas, agrupado con el selector de idioma (en móvil solo la lupa; el texto sigue siendo el nombre accesible). No hay una caja en cada cabecera porque en móvil añadiría otra fila. `buscar.html` y `en/buscar.html` tienen un formulario GET (`role="search"`, etiqueta visible) a `buscar.html?q=…`, así que la dirección de unos resultados se puede compartir. El recuento se anuncia en `role="status"`, y cada resultado enlaza al apartado exacto («Proyectos › Experiencia») con un fragmento donde las palabras van en `<mark>` (contraste 15,3:1). Sin resultados, se sugiere el mapa del sitio. Sin JavaScript, un `<noscript>` remite al mapa. Ayuda lo explica.
    - **Búsqueda (`search.js`, ES5):** sin distinguir mayúsculas ni tildes; un apartado aparece si contiene todas las palabras, y primero los que las tienen en el título. Los resultados se construyen con `textContent`, nunca con HTML del usuario.
    - **Comprobado en Edge:** «KAFKA» (4 resultados en ES y en EN), «practicas» encuentra «Prácticas», «tfg pytorch» da 1, «zzzz» da 0 con sugerencia, y `<img src=x onerror=…>` se muestra como texto. Capturas a 1280 px (ES, resultados) y a 500 px (EN, sin resultados). El comprobador de enlaces da 15 páginas, 436 enlaces internos y 0 rotos.
- [x] **FU-02** Flechas y botones del carrusel con el destino en el texto («Anterior: Proyectos»)
  - Media · S (relacionado con lo que C y J dicen de las etiquetas) · métricas 3.2, 1.2
  - Hecho el 2026-11-12: los botones ‹ › del carrusel inferior son ahora enlaces `<a rel="prev|next">` con el destino visible («‹ Anterior: Galería», «Siguiente: Sobre mí ›») en las 5 páginas, así que también funcionan sin JavaScript. Por debajo de 400 px «Anterior:»/«Siguiente:» se ocultan a la vista pero se leen. En móvil los puntos van en su fila y los enlaces debajo. Las flechas laterales fijas ya decían el destino en su `aria-label`; EV-01 las sustituirá por vistas previas con título.
- [x] **FU-03** Prev/next unificado con bucle en teclado, flechas laterales y botones
  - Alta · C, S · métricas 3.2, 2.1, 5.1
  - Hoy los botones y las flechas laterales hacen bucle y el teclado no.
- [x] **FU-04** Contexto en los enlaces repetidos («Repositorio de BasaltDB») con texto oculto visualmente
  - Media · S, J · métricas 3.2, 2.3
  - Afecta a las tarjetas de Proyectos (Repositorio, Docs y Demo se repiten en las 4).
  - Hecho el 2026-11-12: utilidad `.visually-hidden` y texto oculto en los 6 enlaces de las tarjetas. Los nombres accesibles, comprobados en el DOM de Edge, son únicos: «Repositorio del TFG», «Docs del TFG», «Demo del TFG en YouTube», «Repositorio de BasaltDB», «Repositorio de WiChat» y «Repositorio de Outfitly». A la vista no cambia nada.

### Contenidos (hito M4)

Las cuatro primeras tareas necesitan datos que solo puede aportar Francisco.

- [x] **CO-01** Ampliar aficiones con detalles personales (qué deporte, viajes, música, cine…)
  - Alta · C, M, J, S · métrica 4.1
  - Enlazar con la Galería.
  - Hecho el 2026-11-12: «Intereses y aficiones» de Sobre mí se divide en «Intereses profesionales» y «Fuera del trabajo» (deporte, viajes con enlace a la Galería, música y lectura), con los datos de Francisco.
- [x] **CO-02** Fechas de grado y máster, ficha de prácticas (empresa, fechas, equipo, logros) y años en los proyectos
  - Alta · C, M, J, S · métrica 4.2
  - Observación propia: Sobre mí dice «Realizando unas prácticas» y «realicé unas prácticas». Aclarar si están en curso.
  - Hecho el 2026-11-12: Proyectos tiene las fechas del grado (2022 – julio de 2026) y del máster (desde septiembre de 2026), y una sección «Experiencia» con la ficha de las prácticas en NTT Data (feb.–abr. 2026 y oct. 2026 – feb. 2027, en curso; migración de microservicios de un cliente retail). Sobre mí e Inicio dicen lo mismo, así que ya no se contradicen. Los años de los proyectos (TFG 2025–2026, WiChat 2025, Outfitly 2025–2026, BasaltDB desde 2026) salen de las fechas de los repositorios en GitHub; Francisco los confirmó el 2026-11-12. No hay dato del tamaño del equipo.
- [x] **CO-03** CV descargable en PDF accesible, enlazado desde Inicio y Proyectos
  - Media · S · métricas 4.3, 4.2
  - Hecho el 2026-11-12 con el CV de Francisco (`assets/cv/`, solo en español): botón «Descargar mi CV (PDF, 200 KB)» en Inicio, bajo la presentación; sección «Currículum» al final de Proyectos con el mismo botón y una vista previa de la hoja (WebP de 400 px, 48 KB, diferida, con `alt`); y entrada en el mapa de Ayuda. El PDF ya venía etiquetado (`/MarkInfo`, árbol de estructura, texto seleccionable con tildes); se le corrige el idioma (`en-US` → `es-ES`) y el título (era el nombre del fichero; ahora «Currículum de Francisco Cimadevilla Cuanda», que el visor muestra). Límites: casi no tiene encabezados etiquetados (un solo `H4`), la foto no tiene texto alternativo y el orden de lectura mezcla títulos y bloques. Eso solo se arregla exportándolo de nuevo desde el original con encabezados reales. Originales en `C:\Code\webPersonal-originales\cv`. **Que revise Francisco:** el PDF publica su teléfono y su correo de la universidad.
- [ ] **CO-04** Referencias de personas que avalan
  - Alta · C, M, J, I, S (media 0,2) · métrica 4.4
  - Pedir permiso y texto a 2–3 personas (tutor del TFG, responsable de prácticas, compañeros). Después, sección «Referencias» con cita, nombre, cargo y relación. Si no llegan a tiempo: «Disponibles bajo petición» con enlace a contacto. No publicar datos de terceros sin su permiso.
  - 2026-11-12, sección hecha y tarea abierta: Proyectos tiene la sección «Referencias» con dos citas, la de Pedro María (responsable de prácticas en NTT Data), tal como la resumió Francisco, y la de Cristian (tutor del TFG), escrita como borrador para que él la apruebe. Por decisión de Francisco, las dos se publican con la marca visible «Pendiente de confirmación» (`.reference-pending`). Cuando cada uno confirme su texto, se quita su marca; con las dos confirmadas, se cierra la tarea (T34, en revisión).

### Confiabilidad (hito M5)

- [x] **CF-01** Corregir el texto del enlace a LinkedIn y unificar el de GitHub
  - Alta · J · métricas 5.1, 1.6
  - Texto `in/franciscoc-cimadevilla`, enlace `.../in/francisco-cimadevilla`. El texto de GitHub (`francimadevilla`) difiere en mayúsculas del enlace (`franCimadevilla`).
  - Hecho el 2026-11-11: el texto visible ahora coincide con el enlace (`linkedin.com/in/francisco-cimadevilla` y `github.com/franCimadevilla`). **Pendiente de Francisco:** confirmar que `francisco-cimadevilla` es de verdad su URL de LinkedIn. Si el bueno es `franciscoc-cimadevilla`, hay que cambiar el `href` y el texto en `index.html`. *Confirmado por Francisco el 2026-11-12: la URL buena es `francisco-cimadevilla`.*
- [x] **CF-02** Errata «NotebookLLM» → «NotebookLM» y pie de foto mezclado («Neuschwanstein Castle» → «Castillo de Neuschwanstein»)
  - Media · S · métrica 5.1
- [x] **CF-03** «Última actualización: dd/mm/aaaa» con `<time>` en el pie de todas las páginas
  - Alta · C, M, J, I, S (media 1,4) · métrica 5.4
  - S la llama «la mejora más barata».
- [x] **CF-04** Automatizar esa fecha con la del último commit en el workflow de Pages
  - Baja · opcional · métrica 5.4
  - Hecho el 2026-11-12: `tools/stamp-date.py` (solo biblioteca estándar de Python) cambia el `<time>` del pie de las 15 páginas por la fecha del último commit. En español va como dd/mm/aaaa y en inglés como «12 November 2026»; avisa si una página no tiene la fecha. El workflow de Pages lo ejecuta antes de publicar, así que la fecha desplegada es siempre la del commit que se despliega. Probado en local con otra fecha (cambian las 15 páginas en los dos formatos) y, al volver a la del commit, los ficheros quedan idénticos. La fecha escrita en el repositorio solo se ve en local. No se ha probado dentro de GitHub Actions, porque no se ha hecho push.
- [x] **CF-05** Quitar las reglas CSS sin uso con `pointer-events` y revisar los avisos del validador
  - Media · J, C, I · métrica 5.3
  - J obtuvo 2 errores en el perfil CSS3. Ningún elemento usa `disabled` ni `aria-disabled`, así que `.carousel-btn:disabled` y `.page-lateral-nav [aria-disabled]` sobran. Revisar también el aviso de extensión de proveedor (C, I) y el de fuentes (J).
  - Hecho el 2026-11-12: fuera `.carousel-btn:disabled` (desde FU-02 es un enlace y no puede deshabilitarse) y `.page-lateral-nav a[aria-disabled]`. Ya no queda ningún `pointer-events` en el CSS. Se quita `-apple-system` de `font-family`, que es la extensión de proveedor que marca el validador (`system-ui` ya cubre Safari). Se conserva `.button:disabled`, que usa el formulario mientras envía. El aviso de fuentes (J) y el resultado final del validador se comprueban en CF-06, porque el validador es un servicio externo.
- [ ] **CF-06** Revalidar HTML y CSS en el W3C (ES y EN) y guardar la evidencia
  - Alta · S (C, M, J e I ya dan 0 errores) · métricas 5.2, 5.3
  - Se puede usar `tests/w3c-validate.js`.
- [x] **CF-07** Revisar enlaces internos y externos tras los cambios (ES y EN)
  - Media · C · métrica 5.1
  - Hecho el 2026-11-12:
    - **Internos:** un script recorre las 15 páginas (ES, EN, Ayuda, Buscar y 404) y comprueba 436 enlaces y recursos (`href`, `src`, `srcset`, `poster`, anclas incluidas, y las rutas `/webPersonal/…` de la 404): 0 rotos.
    - **Externos:** GET a los 9 enlaces. Responden 200 los 6 de GitHub, la documentación del TFG, la Universidad de Oviedo y la demo de YouTube. LinkedIn devuelve 999, su respuesta habitual a clientes automáticos; la dirección es la que confirmó Francisco.
    - **Pendiente tras el push:** los `<link rel="alternate" hreflang>` apuntan a la web publicada, que todavía no tiene `en/` ni `buscar.html`; hay que abrir uno después de desplegar.

### Eficiencia (hito M6)

- [x] **EF-01** Optimizar las 6 fotos de la galería (≈21 MB → menos de 1,5 MB)
  - Alta · C, M, J, I, S · métricas 6.1, 6.2, 1.4
  - Redimensionar a 1600 px o menos y servir WebP/AVIF con JPEG de respaldo en `<picture>`. Poner `width` y `height` (CLS 0,056). Hoy todas llevan `loading="lazy"`; la primera debe cargarse sin lazy y con `fetchpriority="high"`. Guardar los originales fuera del repositorio. Medición de partida: Lighthouse de Galería 75, LCP 36,5 s.
  - Hecho el 2026-11-11: 2 tamaños por foto (lado largo 800 y 1600 px) en AVIF con JPEG de respaldo, `<picture>` con `srcset`/`sizes`, `width`/`height`, la primera con `fetchpriority="high"` y el resto con `loading="lazy"`. Peso: 21 MB → 0,28 MB (AVIF 800, escritorio) o 0,99 MB (AVIF 1600, pantallas de alta densidad). Originales en `C:\Code\webPersonal-originales\img\viajes` (y en el historial de git).
- [x] **EF-02** Optimizar los 4 vídeos (≈27 MB → menos de 8 MB)
  - Alta · C, S (miniatura) · métricas 6.1, 6.2, 1.3
  - H.264 a 720p, CRF ≈ 28, `faststart`. Añadir `poster`, `preload="none"` y `width`/`height` a cada `<video>`. `tfg-clip.mp4` pesa 14,7 MB.
  - Hecho el 2026-11-11: H.264 (High) a 720p, CRF 28, `preset slow`, `faststart` y sin pista de audio (las 4 pistas eran silencio digital, −91 dB). 27 MB → 1,6 MB (`tfg-clip.mp4`: 14,7 MB → 0,95 MB). Póster WebP 960×540 (56 KB los 4) en `assets/img/posters/`, `preload="none"`, `width="1280" height="720"` y `video { width: 100%; height: auto; }` en el CSS. Originales en `C:\Code\webPersonal-originales\video`.
- [x] **EF-03** Sustituir el Typing SVG externo por una animación CSS propia con texto real
  - Alta · C, M, J, S (I la valora, así que se mantiene el efecto) · métricas 6.2, 6.1, 2.2, 1.3, 5.1
  - Quita la dependencia de `readme-typing-svg` (~2 s de espera), el `alt` «Typing SVG» que no dice nada y el recorte «Softw» que vio M. Respetar `prefers-reduced-motion`.
  - Hecho el 2026-11-11: `<ul class="tagline" lang="en">` con las tres frases como texto real; cada `<li>` se escribe y se borra con `steps()` sobre la anchura en `ch` (una frase cada 4 s, ciclo de 12 s). Las tres comparten celda de rejilla, así que la altura no cambia. Con `prefers-reduced-motion` se ven las tres quietas; sin CSS, como lista. Fuera la petición a `readme-typing-svg` y el `alt` «Typing SVG». El 2026-11-12 las frases se tradujeron al español (decisión 3 de la sección 4).
- [ ] **EF-04** Remedir con PageSpeed Insights (móvil) y Lighthouse, y registrar antes y después
  - Alta · C, M, J, I · métricas 6.1, 6.2, 1.4
  - Objetivo: Rendimiento de 90 o más en todas las páginas, LCP por debajo de 2,5 s y CLS por debajo de 0,1. Las 5 páginas llevan hoy un script de Contentsquare sin commitear: medir con y sin él.

## 3. Recomendaciones ya cumplidas o descartadas

Estas recomendaciones aparecen en la auditoría, pero no generan tarea.

| Recomendación | Quién | Por qué no hay tarea |
|---|---|---|
| Declarar `lang` | S (1.5) | `lang="es"` ya está en las 5 páginas. En la versión inglesa se pondrá `lang="en"` (US-09). |
| Marcar la página activa con `aria-current` | S (1.1, 3.2) | Ya está en el menú y en los puntos. C lo confirma. |
| Corregir los enlaces vacíos («el error más grave») | S (2.3) | No hay enlaces vacíos: los puntos del carrusel tienen `aria-label`. Lighthouse da 100 (C, M, I) y WAVE no da errores (J). AC-06 lo vuelve a comprobar. |
| `aria-label` en los enlaces numerados y en las flechas | S (2.1) | Ya existen. Falta corregir la numeración (US-01) y añadir el destino (FU-02). |
| Texto alternativo en la foto de perfil | S (2.2) | Ya tiene `alt="Fotografía personal de Francisco Cimadevilla"`. |
| Pasar los validadores W3C y pegar el resultado | S (5.2, 5.3) | C, M, J e I ya midieron 0 errores. Se repite en CF-06 para dejar evidencia. |
| Botón claro para volver | S (1.2) | Lo cubren FU-02 (flechas con destino) y US-05 (404 con botón al inicio). |
| Bloque de contacto en todas las páginas | S (4.3) | Lo cubre US-10 (pie común). |
| Reproductor con miniatura para los vídeos | S (1.3) | Los vídeos ya tienen controles. Falta el `poster` (EF-02). |

Las puntuaciones bajas de S en 2.3, 5.2 y 5.3 (3,5 y 5) reflejan que no midió con herramientas, no defectos del sitio. Los demás evaluadores dieron 10 en esas tres métricas.

## 4. Decisiones ante criterios en conflicto

Son decisiones por defecto. No bloquean el plan: cada una se puede revisar antes de empezar las tareas que afecta. La única que conviene tener confirmada antes de US-09 es la 3, porque EF-03 rehace la portada y la copia en inglés la heredaría.

1. **Triple navegación** (menú, flechas laterales y carrusel inferior). C y J la ven redundante; M e I la valoran con 9 y 10 en 3.2. **Decisión:** se mantienen el menú y el carrusel inferior y se corrigen sus etiquetas (US-01, FU-02). Las flechas laterales fijas pasan a ser vistas previas de las páginas vecinas en pantallas anchas (EV-01) y se conservan como respaldo entre 769 y 1199 px. Se vuelve a preguntar en la tanda 2.
2. **Flecha «›» de Galería que lleva a Inicio.** S lo toma por un error y C lo ve incoherente porque el teclado no hace bucle. **Decisión:** el bucle se mantiene en todos los mecanismos (FU-03) y se rotula el destino (FU-02).
3. **Frase animada de la portada.** I la pone como ejemplo de buena estética (10 en 1.3). C, M, J y S señalan un `alt` inútil, una dependencia externa y un recorte del texto. **Decisión:** se mantiene el efecto, hecho con CSS y texto real (EF-03). *Confirmada por Francisco el 2026-11-12, con las frases traducidas al español y las siglas sin traducir: «Ingeniero de software», «Entusiasta de ML y datos», «Siempre aprendiendo algo nuevo».*
4. **Buscador en un sitio de 5 páginas.** S lo aplaza «si el sitio crece»; los otros cuatro ponen un 0. **Decisión:** se implementa uno ligero (FU-01), porque es la única métrica en 0 para los cinco evaluadores.
5. **Más imágenes en Sobre mí y Proyectos** (S) frente al peso de la galería (C, M, J, I). **Decisión:** solo en WebP ligero y después de EF-01 (US-07, prioridad baja).
6. **Adaptabilidad a móviles.** M, J e I la puntúan con 9 y 10; C y S con 6 y 6,5 por el rendimiento de la Galería, no por el diseño. **Decisión:** no se toca el diseño adaptable; se arregla el peso de las fotos y los vídeos (EF-01, EF-02).

## 5. Orden de ejecución recomendado

1. Arreglos rápidos y de mucho peso: CF-01, CF-02, CF-03, US-01, FU-03, AC-01.
2. Rendimiento: EF-01, EF-02, EF-03.
3. Contenido, empezando por pedir las referencias (CO-04) porque hay que esperar respuesta: CO-01 a CO-04.
4. Navegación y accesibilidad del código: US-02 a US-08, US-10, FU-02, FU-04, AC-02 a AC-05, CF-05.
5. Versión en inglés (US-09) y buscador (FU-01), cuando el contenido ya esté cerrado. *Bloqueado por Francisco el 2026-11-12 hasta hablar del CV; desbloqueado ese mismo día, cuando aportó el CV (CO-03). Hecho el 2026-11-12.*
6. Mejora evolutiva EV-01, cuando la versión en inglés ya esté hecha. *Hecho el 2026-11-12.*
7. Verificación final: AC-06, AC-07, CF-06, CF-07, EF-04.

## 6. Mejoras evolutivas

Estas mejoras no salen de la auditoría: las pide Francisco. Van en el hito M7 del plan, y las verificaciones finales (AC-06, CF-07 y EF-04) esperan a que terminen.

- [x] **EV-01** Carrusel con vistas previas laterales y deslizamiento (efecto de la tienda de Steam)
  - Media · petición propia · mejora 1.1, 1.3 y 3.2; hay que vigilar 1.4, 2.1, 2.3 y 6.1 · ≈14,5 h
  - **Qué hace:** a los lados de la página actual se ven las páginas anterior y siguiente en miniatura, con su título en tamaño normal. Al hacer clic en una de ellas, en los botones ‹ › o con ← →, la página se desliza hacia ese lado y se navega. La página nueva entra por el lado correcto.
  - **Decisiones tomadas:**
    - Vista previa: clon vivo del `<main>` vecino, leído con `fetch` tras el evento `load`. Sin imágenes, vídeos ni audio (quedan cajas con las proporciones de `width`/`height`), sin `id`, con `aria-hidden` e `inert`, escalado con CSS y recortado.
    - Sustituye a las flechas laterales fijas desde ≈1200 px. Entre 769 y 1199 px, y sin JavaScript, se conservan las flechas actuales.
    - Deslizar y recargar: la animación termina y se navega a la página real. No hay `pushState`.
    - En móvil (≤768 px) no hay vistas previas por falta de sitio. Se cambia de página deslizando con el dedo.
  - **Límites:**
    - Hueco lateral ≈ (ancho − 960) / 2: 160 px a 1280, 203 px a 1366 y 240 px a 1440. A esos tamaños la miniatura da la silueta de la página, no se lee.
    - El título de la vista previa sale del `<title>` de la página vecina, así que en `/en/` funciona sola. Los textos fijos del JS («Anterior», «Siguiente») van en ES y EN según `<html lang>`.
    - Con `file://` las vistas previas no aparecen y la web sigue funcionando.
    - Si la dirección del deslizamiento no se aplica antes del primer pintado, hará falta un script mínimo en el `<head>` de cada página.
    - El gesto táctil no debe activarse sobre vídeo, audio ni controles de rango, ni en los ~20 px del borde (gesto «atrás» del sistema). Los botones siguen siendo la alternativa de un solo toque.
  - **Dependencias:** FU-02, FU-03, AC-03, US-08, EF-01 (los `width`/`height` de las cajas) y US-09.
  - **Subtareas:**
    - [x] Leer las páginas vecinas y construir el clon sin multimedia (4 h)
    - [x] CSS de las vistas previas y reemplazo de las flechas laterales (3 h)
    - [x] Deslizamiento con entrada direccional y `prefers-reduced-motion` (3 h)
    - [x] Deslizar con el dedo en móvil (2,5 h)
    - [x] Pruebas a 1280, 1366 y 1920 px, en móvil real, sin JavaScript y con `file://`, y medición de CLS y LCP (2 h)
  - Hecho el 2026-11-12 (T52–T56):
    - **Miniaturas:** desde 1200 px, `main.js` lee con `fetch`, después del evento `load`, la página anterior y la siguiente. Limpia su `<main>` dentro del documento de `DOMParser`, así que no descarga nada: imágenes, vídeos y audio pasan a cajas grises con sus proporciones, los enlaces a `<span>` y se quitan los `id`. Lo mete en las flechas laterales con `aria-hidden` e `inert`. El enlace conserva su `aria-label` («Página siguiente: Proyectos»), que contiene el título visible. Comprobado: no se descarga ninguna imagen de las páginas vecinas.
    - **Estilos:** la franja ocupa el hueco (ancho − 960 px) / 2, con el título de la página vecina en tamaño normal y la miniatura escalada en un marco 3:4 recortado. Entre 769 y 1199 px, sin JavaScript y con `file://` quedan las flechas de siempre (comprobado en los tres casos).
    - **Deslizamiento:** con un clic en la vista previa, en los enlaces ‹ › o con ← →, el contenido sale hacia el lado contrario en 0,28 s y se navega a la página real. La dirección viaja en `sessionStorage` y la página nueva entra por el lado correcto. Los clics con Ctrl, Cmd o Mayús abren en otra pestaña como siempre. Con `prefers-reduced-motion` no hay animación, tampoco la de entrada de `.page`, que antes no lo respetaba. Al volver con «Atrás» desde la caché del navegador, la página se ve.
    - **Móvil:** hasta 768 px se cambia de página deslizando el dedo: 60 px o más, con el horizontal al menos 1,5 veces el vertical y en menos de 0,8 s. No actúa desde los 20 px del borde, sobre vídeo, audio, campos, controles de rango o zonas con desplazamiento horizontal, ni con texto seleccionado. Los escuchadores son pasivos, así que el desplazamiento vertical no se bloquea y no hace falta `touch-action`.
    - **Script en el `<head>`** de las 10 páginas del carrusel: aplica la dirección de entrada y, desde 1200 px, reserva el hueco de las vistas previas antes del primer pintado. Hizo falta porque la primera medición daba CLS 0,016: `main.js` se ejecuta después de pintar y la franja derecha se ensanchaba.
    - **Comprobado en Edge (headless, servidor local):** capturas a 1000, 1280, 1366 y 1920 px; DOM de las miniaturas y recursos descargados; navegación con y sin movimiento reducido; 7 casos de gesto táctil sintético (solo navegan los válidos, y no por encima de 768 px). CLS 0,000 en las 5 páginas (y en Inicio EN) a 1366 y 1920 px; LCP local de 0,2–0,6 s. Las mediciones en local no sustituyen a PageSpeed (EF-04).
    - **No comprobado:** en un móvil real (gesto y rendimiento), y que la animación de salida llegue a `animationend` en un navegador real. Edge headless no hace avanzar las animaciones CSS, así que allí navegó el temporizador de respaldo de 400 ms. Queda para AC-07 / la revisión de Francisco.
- [x] **EV-02** Ajustes de las vistas previas laterales: altura de la ventana, blur, 1/4 de la página y transición por desplazamiento
  - Petición de Francisco del 2026-11-12 sobre EV-01 · T58–T63 en el plan (hito M7)
  - **Supuestos** (anotados en el plan; Francisco pidió empezar sin cambiarlos): «1/4» es el cuarto del ancho de la página vecina que queda junto a la actual; la vista previa ocupa toda la altura, también bajo la cabecera; el título se mantiene por encima del blur; en la transición, la vista previa viaja al centro.
  - Hecho el 2026-11-12:
    - **Altura:** la vista previa ocupa la franja de arriba abajo, en lugar del marco 3:4. El título va superpuesto en el centro, en una pastilla, y la miniatura empieza a la altura del contenido de la página actual.
    - **1/4:** la franja izquierda muestra el cuarto derecho de la página anterior y la derecha, el cuarto izquierdo de la siguiente. El cuarto (240 px) no se amplía nunca: hasta 1440 px se reduce para caber (0,67 a 1280, 0,85 a 1366) y desde ahí se ve a tamaño real, pegado al borde interior, con el resto de la franja libre. Con un cuarto exacto a 1920 px la miniatura salía al doble de tamaño.
    - **Blur:** la miniatura se difumina con `filter: blur(3px)` (1,5 px al pasar el ratón; lo soportan todos los navegadores actuales, así que no hace falta plan B). Un degradado la funde con el fondo hacia el borde exterior. El título queda nítido.
    - **Transición:** con vistas previas, el carrusel se mueve entero un hueco de 960 px en 0,5 s. La página actual sale hacia el lado contrario y se difumina, la vista previa del destino viaja al centro, pierde el blur y pasa a tamaño real, y la del otro lado sale de la pantalla. Solo se animan `transform` y `filter`. La página nueva aparece ya centrada, sin animación de entrada (`data-enter="…-carousel"`), y sus vistas previas entran con un fundido. Sin vistas previas (por debajo de 1200 px, en el móvil, sin JavaScript, con `file://`) se mantiene lo de EV-01; con movimiento reducido no hay animación. Al volver con «Atrás» desde la caché, todo vuelve a su sitio.
    - **Foco:** el marco de la miniatura tapaba el anillo de foco del enlace. Ahora la vista previa dibuja un anillo de 3 px en `--accent` por encima (con una variable heredada, sin subir la especificidad).
    - **Ayuda** (ES y EN): explica las vistas previas y el gesto del móvil, que antes no constaba.
    - **Comprobado en Edge (headless, servidor local):** capturas a 1000, 1280, 1366 y 1920 px. Fotogramas de la transición a 0, 250 y 500 ms, congelando las animaciones con la Web Animations API: hacia delante y hacia atrás, la página de destino acaba exactamente en la posición del contenido real. En destino, `data-enter="next-carousel"`. Con movimiento reducido navega directamente. CLS 0,000 en las 5 páginas a 1280, 1366 y 1920 px. Anillo de foco visible. A 1000 px y con `file://`, las flechas de siempre. 0 enlaces rotos.
    - **Ajuste del 2026-11-13** (petición de Francisco): margen de 1,5rem (24 px) entre la página actual y cada vista previa, y la mitad de contenido visible. Ahora se ve un octavo de la página vecina (120 px a tamaño real como mucho) a la misma escala que antes, en un marco la mitad de ancho. El desplazamiento del carrusel suma ese margen, para que la página de destino siga acabando en su sitio. El título se centra sobre el marco, como poco a 4rem del borde interior. Comprobado en Edge headless a 1280, 1366 y 1920 px: margen de 24 px, escala 0,48, 0,66 y 1, y la página de destino acaba en la posición exacta del contenido real.
    - **Segundo ajuste del 2026-11-13** (petición de Francisco: «se ven sueltos»): las dos miniaturas, con el mismo tamaño, van pegadas al borde izquierdo y derecho de la pantalla. El hueco entre la página actual y cada miniatura queda libre (24 px como poco) y el título se centra sobre la miniatura. El desplazamiento del carrusel mide ese hueco con decimales. Comprobado en Edge headless a 1280, 1366 y 1920 px: los marcos tocan el borde de la ventana y, en los dos sentidos, la página de destino acaba en la posición exacta del contenido real (diferencia de 0 px).
    - **Tercer ajuste del 2026-11-13** (petición de Francisco): el área que se puede pulsar es exactamente la miniatura. El enlace lateral, que antes ocupaba todo el hueco lateral, mide ahora lo mismo que la miniatura (la mitad del hueco tras 1,5rem de margen, como mucho 7.5rem), y la miniatura lo llena. La parte de la pastilla del título que sobresale de la miniatura en pantallas estrechas no recibe el puntero (`pointer-events: none`). Comprobado en Edge headless a 1280, 1366 y 1920 px: el enlace y la miniatura coinciden al décimo de píxel; con `elementFromPoint`, 1 px dentro de la miniatura es el enlace y 1 px fuera ya no; la transición sigue acabando en la posición exacta en los dos sentidos. Capturas de Proyectos, Galería y About me a 1280 px: las pastillas se ven enteras.
    - **Límites y no comprobado:** durante el viaje la miniatura no lleva imágenes (cajas grises) y sus enlaces no aparecen subrayados, así que al cargar la página real aparecen las fotos (se evita descargar la multimedia de las vecinas). No he medido la fluidez real ni el coste del blur en GPU, porque Edge headless no hace avanzar las animaciones. Falta probarlo en un navegador real (DevTools › Performance) y en pantallas de alta densidad.
- [x] **EV-03** Tagline de la portada: animación de escritura siempre visible y casilla de pausa
  - Petición de Francisco del 2026-11-13: el tagline no hacía lo que el Typing SVG externo (cada frase se escribe letra a letra, se borra y pasa a la siguiente) · T64 en el plan (hito M7)
  - **Causa:** el equipo de Francisco tiene desactivados los efectos de animación de Windows, así que el navegador informa `prefers-reduced-motion: reduce` y EF-03 mostraba las tres frases quietas. Con movimiento permitido la animación ya funcionaba (comprobado congelando fotogramas). Lo mismo explica que no viera el deslizamiento entre páginas (EV-01, EV-02).
  - **Decisión de Francisco:** el tagline se anima siempre, porque escribir letra a letra no desplaza nada en pantalla; el deslizamiento entre páginas sigue sin animación con movimiento reducido. Revisa lo dicho en EF-03 sobre `prefers-reduced-motion`.
  - Hecho el 2026-11-13:
    - Fuera la excepción de movimiento reducido del tagline.
    - Casilla «Pausar animación» / «Pause animation» bajo la frase (WCAG 2.2.2: la animación se repite sin fin). Funciona sin JavaScript: `.tagline-box:has(:checked)` pone `--tagline-play: paused` y las frases la heredan en `animation-play-state`, sin pasar del tope de especificidad. main.js solo la recuerda durante la visita (`sessionStorage`). Va debajo y no al lado, porque al lado se movería mientras la frase se escribe. Área de 24 px de alto (2.5.8).
    - **Ayuda** (ES y EN): nuevo punto «Animaciones», con la pausa y lo que pasa con reducir movimiento. Índice del buscador regenerado.
    - **Comprobado en Edge (headless, que informa `reduce` como el equipo de Francisco):** con el CSS real, la animación corre y escribe, mantiene y borra cada frase (anchuras congeladas a 0–9 s, ES y EN); al marcar la casilla `animation-play-state` pasa a `paused` y se guarda; al desmarcarla, `running`. Nombre accesible de la casilla correcto. Captura a 1280 px.
    - **No comprobado:** lector de pantalla real y navegador real con los efectos de animación activados.
- [x] **EV-04** Sobre mí: fotos integradas en el texto en lugar de al pie de los párrafos
  - Petición de Francisco del 2026-11-13 · T65 en el plan (hito M7)
  - Hecho el 2026-11-13:
    - La foto de la graduación va al principio de «Mi historia» y la del concurso de Empathy al de «Intereses y aficiones» (ES y EN). Desde 720 px flotan a la derecha (15rem) y el texto y las listas las rodean; la de la graduación llega hasta «Actualmente». En el móvil quedan encima del texto, como antes. `clear: right` impide que una foto se monte en la anterior. La fila de esquí y surf se queda al final, como cierre de «Fuera del trabajo».
    - `h2` pasa a `display: flow-root`: junto a una foto el título se estrecha, en lugar de pasar su línea inferior por debajo de ella. Sin fotos flotantes no cambia nada.
    - Mismos `alt`, pies de foto, `width`/`height` (sin CLS) y carga diferida. Índice del buscador regenerado.
    - **Comprobado en Edge (headless):** capturas de Sobre mí a 1280 px (ES y EN), 800 y 500 px.
