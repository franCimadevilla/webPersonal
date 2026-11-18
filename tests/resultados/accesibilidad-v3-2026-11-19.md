# Accesibilidad AAA de la v3: análisis inicial y correcciones (Fase 2)

Fecha: 19/11/2026. Código analizado: rama `mejoras-tanda-2` (commit `24ff928`), servida como HTML por
`https://raw.githack.com/franCimadevilla/webPersonal/mejoras-tanda-2/<página>` porque la web publicada
(`main`) era todavía la v2. Las correcciones de este documento están en la copia de trabajo, sin commit ni despliegue.

## 1. Resultados iniciales (antes de corregir)

### WAVE (wave.webaim.org), 15 páginas

| Página | Errores | Contraste | Alertas | Detalle de errores y alertas |
|---|---|---|---|---|
| index / en/index | 1 | 0 | 2 | Error «Missing form label»: campo trampa `_honey` del formulario. Alertas: enlace redundante (marca e «Inicio»), enlace a PDF |
| sobre-mi | 0 | 0 | 2 | Enlace redundante ×2 (marca/«Inicio»; flecha anterior/punto 1 del carrusel) |
| proyectos | 0 | 0 | 4 | Enlace redundante, texto alternativo largo ×2 (capturas del TFG y WiChat), enlace a PDF |
| multimedia | 0 | 0 | 7 | Enlace redundante ×2, «HTML5 video or audio» ×5 (4 vídeos y el podcast) |
| galeria | 0 | 0 | 1 | Enlace redundante |
| ayuda | 0 | 0 | 3 | Enlace redundante ×2, enlace a PDF |
| buscar | 0 | 0 | 2 | Enlace redundante, elemento `noscript` |
| 404 | 0 | 0 | 2 | Enlace redundante ×2 |
| Resto EN | 0 | 0 | 1-7 | Mismas alertas que su página ES |

### TAW (tawdis.net), WCAG 2.1 nivel AAA

Analizadas index, sobre-mi, proyectos, multimedia, galeria y buscar. Resultado idéntico en todas, porque
las advertencias salen de la plantilla común (cabecera con botones, enlaces y formularios):

- **0 problemas**, **20 advertencias** en 11 criterios, **30 puntos no verificados** en 30 criterios.
- Advertencias por criterio: 1.1.1 (2), 1.3.1 (2), 1.4.4 (1), 2.4.2 (1), 2.4.6 (2), 3.2.5 (4), 3.3.1 (2),
  3.3.3 (1), 3.3.4 (3), 3.3.5 (1), 3.3.6 (1).
- El informe detallado de TAW solo se envía por correo; el desglose anterior es el del informe resumen.
- El servicio gratuito admite un análisis cada 20 segundos.

### AChecker (achecks.org/achecker, WCAG 2.0 nivel AAA), 15 páginas

El dominio clásico `achecker.achecks.ca` no carga (certificado TLS no válido); se usó `achecks.org/achecker`,
que mantiene el AChecker original.

| Página | Conocidos | Probables | Potenciales | Problemas conocidos y probables |
|---|---|---|---|---|
| index / en/index | 5 | 27 | 81-82 | 213, 57 y 188 en el campo trampa; 206 y 188 en la casilla «Pausar animación» |
| en/proyectos | 1 | 30 | 95 | 117: elemento `<i lang="es">` |
| multimedia (ES/EN) | 0 | 24 | 52-53 | Probable 82: párrafo entero en `<em>` («El clip termina aquí») |
| buscar (ES/EN) | 0 | 17 | 55-56 | Probable 81: `<ol>` de resultados vacía |
| Resto | 0 | 17-38 | 48-95 | Probable 18 en todos los enlaces |

## 2. Contraste entre herramientas: errores reales y falsos positivos

| Hallazgo | WAVE | AChecker | TAW | Dictamen | Acción |
|---|---|---|---|---|---|
| Campo trampa `_honey` sin etiqueta | Error | Conocido | No | **Real** (WCAG 1.3.1, 3.3.2, 4.1.2) | Etiqueta y contenedor `hidden` |
| Casilla «Pausar animación» sin etiqueta | Sin error (la reconoce) | Conocido | No | **Falso positivo**: etiqueta envolvente válida que AChecker no detecta | `for="tagline-pause"` para que la detecten todas |
| `<i lang="es">` | No | Conocido | No | **Falso positivo**: en HTML5 `<i>` es correcto para palabras extranjeras; AChecker aplica un criterio de WCAG 1.0 | `<span class="foreign" lang="es">` |
| Enlaces que abren ventana nueva (18) | No | Probable | Advertencia 3.2.5 | **Falso positivo**: ningún enlace usa `target` ni `window.open` | Ninguna (se documenta) |
| `<ol>` vacía en Buscar (81) | No | Probable | No | Real en el HTML inicial | La lista la crea `search.js` |
| Párrafo en `<em>` (82) | No | Probable | No | Real (énfasis usado como estilo) | Clase `transcript-end` |
| Texto alternativo largo | Alerta | No | Advertencia 1.1.1 | Mejora | `alt` de menos de 100 caracteres |
| Enlaces redundantes | Alerta | No | No | Por diseño: marca, menú y carrusel son mecanismos distintos (2.4.5) | Ninguna (se documenta) |
| Vídeos sin alternativa | Alerta | No | 1.2.x «no aplicable» | **Real**: vídeos sin sonido sin alternativa textual (1.2.1 A, 1.2.8 AAA) | Descripción de cada vídeo |

## 3. Comprobaciones AAA hechas en local (sin herramienta externa)

Script en el navegador sobre las 15 páginas (Chromium, servidor local, 1280 px):

- **1.4.6 Contraste mejorado:** todos los textos ≥ 7:1 (≥ 4,5:1 en texto grande). Sin cambios.
- **2.5.5 Tamaño del objetivo (44 × 44 px):** fallaban las migas de pan, la casilla de pausa, los enlaces de
  contacto de Inicio, los de las tarjetas de proyecto, el mapa del sitio y los desplegables de los vídeos. Corregido.
- **1.4.8 Presentación visual:** líneas de 109 a 122 caracteres (máximo 80). Corregido con `max-width: 62ch`:
  ahora 65-80 caracteres por línea. Interlineado 1,6, sin justificar.
- **3.1.3 y 3.1.4 Palabras inusuales y abreviaturas:** sin mecanismo. Añadidos `<abbr title>` en la primera
  aparición de cada abreviatura por página y una sección «Glosario» en Ayuda (ES y EN).
- **2.4.9 Propósito de los enlaces (solo enlaces):** «descargar en PDF» del mapa del sitio pasa a «descargar el CV en PDF».

## 4. Cambios aplicados al código

| Archivo | Cambio | Criterio WCAG |
|---|---|---|
| index.html, en/index.html | Campo trampa dentro de `<p class="contact-trap" hidden>` con `<label for="cf-trampa">`; `for` en la etiqueta de la casilla de pausa | 1.3.1, 3.3.2, 4.1.2 |
| multimedia.html, en/multimedia.html | Descripción plegable de cada vídeo dentro del pie de foto, enlazada con `aria-describedby`; fin de transcripción con clase | 1.2.1, 1.2.8, 1.3.1 |
| proyectos.html, en/proyectos.html | `alt` más cortos; `<span class="foreign" lang="es">` en lugar de `<i>` | 1.1.1 |
| ayuda.html, en/ayuda.html | Clase `sitemap`, texto del enlace al CV y sección «Glosario» | 2.4.9, 2.5.5, 3.1.3, 3.1.4 |
| buscar.html, en/buscar.html, assets/js/search.js | La lista de resultados la crea el script y se oculta sin resultados | 1.3.1 |
| index, sobre-mi, proyectos, multimedia, ayuda (ES y EN) | `<abbr title>` en la primera aparición de IA/AI, ML, CV, PDF, KB, TFG, SQL, AST, RDBMS, ROC y VGAE-AMIL | 3.1.4 |
| assets/css/style.css | `max-width: 62ch` en el texto de `.page`; áreas de 44 px; estilos de `.transcript-end`, `.video-description`, `.foreign`, `.glossary` y `.sitemap` | 1.4.8, 2.5.5 |
| assets/js/search-index.js | Regenerado con `tools/build-search-index.py` | |

## 5. Verificación tras las correcciones (en local)

- **AChecker WCAG 2.0 AAA** (modo Markup, HTML local): **0 problemas conocidos en las 15 páginas**. Solo queda
  el probable 18 (falso positivo) en los enlaces.
- **Validación HTML** (validator.nu, mismo motor que el W3C): 0 errores y 0 avisos en las 13 páginas
  modificadas. Galería (ES y EN), sin cambios, da `fetchpriority` como error en validator.nu porque su versión
  es anterior; validator.w3.org lo aceptó el 18/11/2026. validator.w3.org respondió HTTP 429 (límite de peticiones).
- **CSS** (jigsaw, perfil `css3svg`): 0 errores.
- **Contraste ≥ 7:1, objetivos ≥ 44 px y ≤ 80 caracteres por línea:** correctos en todas las páginas.
- **Adaptabilidad:** sin desplazamiento horizontal a 320, 375, 768 y 1024 px.
- **Buscador:** resultados en ES y EN; sin resultados, la lista queda oculta y aparece la ayuda.
- **Pendiente:** volver a pasar WAVE y TAW sobre la versión desplegada (necesitan una URL pública) y sacar
  las capturas definitivas.
