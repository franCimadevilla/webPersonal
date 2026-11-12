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
- [ ] **US-02** Migas de pan textuales («Inicio › Proyectos») en las 4 páginas interiores
  - Media · C, M, I, S · métrica 1.1
- [ ] **US-03** Página «Ayuda y mapa del sitio» enlazada desde el pie
  - Media · C, M, I, S · métricas 1.1, 1.2
  - Estructura del sitio, atajos de teclado y cómo contactar. Queda fuera del carrusel de 5 páginas. Se escribe después de FU-03, para documentar el comportamiento final.
- [ ] **US-04** Anunciar el atajo de teclado ← → en la interfaz
  - Alta · C, M · métrica 1.2
  - Pista visible junto al carrusel y `aria-keyshortcuts` en los botones ‹ ›.
- [ ] **US-05** Página 404 propia con botón para volver al inicio
  - Media · C, S · métrica 1.2
- [ ] **US-06** Formulario de contacto con mensaje de confirmación
  - Media · M, S, C · métricas 1.2, 4.3
  - **Decisión previa:** el sitio es estático. Hay que elegir entre un servicio externo (Formspree o Getform, con revisión de privacidad) y un formulario con `mailto:` más confirmación en página. Si no se quiere, se cancela la tarea.
- [ ] **US-07** Imágenes en Sobre mí y capturas en las tarjetas de Proyectos
  - Baja · S · métrica 1.3
  - Solo en WebP ligero, para no empeorar el rendimiento (EF-01).
- [ ] **US-08** Áreas táctiles de al menos 44×44 px
  - Media · S · métricas 1.4, 2.1
  - Aplica a los puntos del carrusel (hoy 12×12 px), el menú y los botones.
- [ ] **US-09** Versión en inglés con selector de idioma
  - Alta · C, M, J, I, S · métrica 1.5
  - Carpeta `/en/` con los mismos nombres de fichero, selector ES/EN en la cabecera, `<html lang="en">` y `hreflang`. Es la última tarea de contenido, para no traducir nada dos veces.
- [ ] **US-10** Pie común con correo, GitHub y LinkedIn (iconos SVG con texto) en las 5 páginas
  - Media · S (C, M, J, I puntúan 1.6 entre 7 y 10) · métricas 1.6, 4.3
  - Cubre también «el bloque de contacto en todas las páginas». Otras redes solo si existen (M).

### Accesibilidad (hito M2)

- [x] **AC-01** Enlace «Saltar al contenido» en las 5 páginas
  - Alta · M, S · métrica 2.1
- [ ] **AC-02** Estilo `:focus-visible` propio y consistente
  - Media · S (C y M dan por válido el foco del navegador) · métrica 2.1
- [x] **AC-03** Atajo ← → seguro
  - Media · C · métrica 2.1
  - Ignorar el atajo con Alt/Ctrl/Mayús/Meta y cuando el foco esté en vídeo, audio o campos de texto. Hoy Alt+← (atrás del navegador) y las flechas sobre un `<video controls>` cambian de página.
  - Hecho el 2026-11-12: `main.js` ignora el atajo con Alt, Ctrl, Mayús o Meta, durante la composición de texto (IME) y con el foco en `input`, `textarea`, `select`, `video`, `audio`, `[contenteditable]` y los roles slider, listbox, menu y tablist. Probado en Edge con 12 casos (`defaultPrevented`): solo navega la flecha sin modificadores fuera de esos elementos.
- [ ] **AC-04** Emojis decorativos con `aria-hidden`
  - Baja · S (en 1.3) · métricas 1.3, 2.2
- [ ] **AC-05** Subtítulos y transcripción de los contenidos multimedia
  - Baja · S · métrica 2.2
  - Primero comprobar qué vídeos tienen audio. *(Comprobado en EF-02: ninguno de los 4 vídeos tiene audio; solo falta la transcripción del podcast.)* Subtítulos con `<track kind="captions">` (WebVTT) y transcripción del podcast en la página.
- [ ] **AC-06** Auditar las páginas ES y EN con Lighthouse, WAVE y axe, y resolver los avisos
  - Alta · J, S · métrica 2.3
  - J vio con WAVE un «posible encabezado» y un enlace repetido. Sospecha: `.site-brand` es un `<p>` con estilo de título. El enlace repetido se resuelve con FU-04.
- [ ] **AC-07** Prueba manual: solo teclado, lector de pantalla (NVDA) e imágenes/CSS desactivados
  - Media · C, M, J, I (método de prueba) · métricas 2.1, 2.2, 2.3
  - Dejar el resultado documentado.

### Funcionalidad (hito M3)

- [ ] **FU-01** Buscador del sitio con Pagefind
  - Alta · C, M, J, I, S (los cinco dan 0) · métrica 3.1
  - Pagefind indexa en el workflow de Pages y funciona en GitHub Pages sin servidor. Caja de búsqueda accesible en la cabecera y página de resultados con `aria-live`. Va después de la versión en inglés, para indexar las dos lenguas y tocar la cabecera una sola vez.
- [x] **FU-02** Flechas y botones del carrusel con el destino en el texto («Anterior: Proyectos»)
  - Media · S (relacionado con lo que C y J dicen de las etiquetas) · métricas 3.2, 1.2
  - Hecho el 2026-11-12: los botones ‹ › del carrusel inferior son ahora enlaces `<a rel="prev|next">` con el destino visible («‹ Anterior: Galería», «Siguiente: Sobre mí ›») en las 5 páginas, así que también funcionan sin JavaScript. Por debajo de 400 px «Anterior:»/«Siguiente:» se ocultan a la vista pero se leen. En móvil los puntos van en su fila y los enlaces debajo. Las flechas laterales fijas ya decían el destino en su `aria-label`; EV-01 las sustituirá por vistas previas con título.
- [x] **FU-03** Prev/next unificado con bucle en teclado, flechas laterales y botones
  - Alta · C, S · métricas 3.2, 2.1, 5.1
  - Hoy los botones y las flechas laterales hacen bucle y el teclado no.
- [ ] **FU-04** Contexto en los enlaces repetidos («Repositorio de BasaltDB») con texto oculto visualmente
  - Media · S, J · métricas 3.2, 2.3
  - Afecta a las tarjetas de Proyectos (Repositorio, Docs y Demo se repiten en las 4).

### Contenidos (hito M4)

Las cuatro primeras tareas necesitan datos que solo puede aportar Francisco.

- [x] **CO-01** Ampliar aficiones con detalles personales (qué deporte, viajes, música, cine…)
  - Alta · C, M, J, S · métrica 4.1
  - Enlazar con la Galería.
  - Hecho el 2026-11-12: «Intereses y aficiones» de Sobre mí se divide en «Intereses profesionales» y «Fuera del trabajo» (deporte, viajes con enlace a la Galería, música y lectura), con los datos de Francisco.
- [x] **CO-02** Fechas de grado y máster, ficha de prácticas (empresa, fechas, equipo, logros) y años en los proyectos
  - Alta · C, M, J, S · métrica 4.2
  - Observación propia: Sobre mí dice «Realizando unas prácticas» y «realicé unas prácticas». Aclarar si están en curso.
  - Hecho el 2026-11-12: Proyectos tiene las fechas del grado (2022 – julio de 2026) y del máster (desde septiembre de 2026), y una sección «Experiencia» con la ficha de las prácticas en NTT Data (feb.–abr. 2026 y oct. 2026 – feb. 2027, en curso; migración de microservicios de un cliente retail). Sobre mí e Inicio dicen lo mismo, así que ya no se contradicen. Los años de los proyectos (TFG 2025–2026, WiChat 2025, Outfitly 2025–2026, BasaltDB desde 2026) salen de las fechas de los repositorios en GitHub: **Francisco debe confirmarlos**. No hay dato del tamaño del equipo.
- [ ] **CO-03** CV descargable en PDF accesible, enlazado desde Inicio y Proyectos
  - Media · S · métricas 4.3, 4.2
- [ ] **CO-04** Referencias de personas que avalan
  - Alta · C, M, J, I, S (media 0,2) · métrica 4.4
  - Pedir permiso y texto a 2–3 personas (tutor del TFG, responsable de prácticas, compañeros). Después, sección «Referencias» con cita, nombre, cargo y relación. Si no llegan a tiempo: «Disponibles bajo petición» con enlace a contacto. No publicar datos de terceros sin su permiso.
  - 2026-11-12, sección hecha y tarea abierta: Proyectos tiene la sección «Referencias», con la recomendación de Pedro María (responsable de prácticas en NTT Data) tal como la resumió Francisco, y a Cristian (tutor del TFG) como «referencia disponible bajo petición» con enlace a contacto. No se publica una cita inventada de Cristian. **Antes del push**, Francisco debe confirmar con Pedro María el texto literal y que acepta salir con su nombre, y pedir a Cristian su texto. Cuando llegue, se sustituye la línea por una cita como la de Pedro y se cierra la tarea.

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
- [ ] **CF-04** Automatizar esa fecha con la del último commit en el workflow de Pages
  - Baja · opcional · métrica 5.4
- [ ] **CF-05** Quitar las reglas CSS sin uso con `pointer-events` y revisar los avisos del validador
  - Media · J, C, I · métrica 5.3
  - J obtuvo 2 errores en el perfil CSS3. Ningún elemento usa `disabled` ni `aria-disabled`, así que `.carousel-btn:disabled` y `.page-lateral-nav [aria-disabled]` sobran. Revisar también el aviso de extensión de proveedor (C, I) y el de fuentes (J).
- [ ] **CF-06** Revalidar HTML y CSS en el W3C (ES y EN) y guardar la evidencia
  - Alta · S (C, M, J e I ya dan 0 errores) · métricas 5.2, 5.3
  - Se puede usar `tests/w3c-validate.js`.
- [ ] **CF-07** Revisar enlaces internos y externos tras los cambios (ES y EN)
  - Media · C · métrica 5.1

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
5. Versión en inglés (US-09) y buscador (FU-01), cuando el contenido ya esté cerrado.
6. Mejora evolutiva EV-01, cuando la versión en inglés ya esté hecha.
7. Verificación final: AC-06, AC-07, CF-06, CF-07, EF-04.

## 6. Mejoras evolutivas

Estas mejoras no salen de la auditoría: las pide Francisco. Van en el hito M7 del plan, y las verificaciones finales (AC-06, CF-07 y EF-04) esperan a que terminen.

- [ ] **EV-01** Carrusel con vistas previas laterales y deslizamiento (efecto de la tienda de Steam)
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
    - [ ] Leer las páginas vecinas y construir el clon sin multimedia (4 h)
    - [ ] CSS de las vistas previas y reemplazo de las flechas laterales (3 h)
    - [ ] Deslizamiento con entrada direccional y `prefers-reduced-motion` (3 h)
    - [ ] Deslizar con el dedo en móvil (2,5 h)
    - [ ] Pruebas a 1280, 1366 y 1920 px, en móvil real, sin JavaScript y con `file://`, y medición de CLS y LCP (2 h)
