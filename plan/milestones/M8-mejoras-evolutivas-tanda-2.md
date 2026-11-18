# M8 – Mejoras evolutivas tanda 2

id: M8
status: planned

Mejoras que salen de la última tanda de pruebas de usabilidad con usuarios (2026-11-18). Cada ticket PU-xx corresponde a un hallazgo de la tabla «Problemas encontrados / Propuestas de mejora». Todos los cambios van en ES y EN y se reflejan en la Ayuda y en Checklist-Auditoria.md.

## Navegación y menú

- [ ] PU-01 Hacer la navegación principal más visible y llamativa en todas las pantallas @owner:francisco @prio:high #usabilidad #navegacion ^T66
      Hallazgo: «No ha encontrado fácilmente la navegación». Propuesta: hacerla más visible para que se lleve el foco.
      Hoy .page-nav son enlaces en gris (--text-muted) sin fondo, al mismo nivel visual que el nombre y las herramientas.
  - [ ] Rediseñar .page-nav como pestañas: tamaño de letra mayor, peso 600, fondo o borde inferior de acento en la página actual y en :hover @est:2.5h @owner:francisco ^T67
        Contraste ≥ 4,5:1 en texto y ≥ 3:1 en el indicador de página actual. Mantener las áreas táctiles de 44 px (US-08) y el anillo de foco.
  - [ ] Cabecera fija (position: sticky) desde 769 px para que el menú se vea siempre al hacer scroll @est:1h @owner:francisco @dep:T67 ^T68
        Comprobar que no tapa los anclajes (scroll-padding-top), el skip-link ni las vistas previas laterales de EV-01/EV-02 (z-index 50). En móvil no se fija para no restar alto (ver PU-06).
  - [ ] Revisar las 7 páginas ES y EN (más 404, ayuda y buscar) y el eyetracking/mapa de calor si se repite la prueba @est:0.5h @owner:francisco @dep:T68 ^T69
- [ ] PU-05 Menú más grande y adaptado en la versión tableta (769–1199 px) @owner:francisco @dep:T66 @prio:high #usabilidad #navegacion #tableta ^T70
      Hallazgo: «El menú era poco visible en la versión Tableta, no se ha fijado». Hoy no hay ningún @media entre 769 y 1199 px: la cabecera de escritorio se encoge y el menú se parte en varias líneas al lado del nombre.
  - [ ] Nuevo punto de corte 769–1199 px: el menú pasa a su propia fila a todo el ancho, con las pestañas repartidas y tamaño de letra ≥ 1.05rem @est:2h @owner:francisco ^T71
        Nombre y herramientas (Buscar, idioma, tamaño de letra) en la primera fila; menú en la segunda. Áreas táctiles ≥ 48 px en tableta.
  - [ ] Probar a 768, 820, 1024 y 1180 px en vertical y horizontal (y en tableta real) @est:1h @owner:francisco @dep:T71 ^T72
- [ ] PU-06 Cabecera compacta en móvil (≤768 px): que el menú no ocupe gran parte de la pantalla @owner:francisco @dep:T66 #usabilidad #navegacion #movil ^T73
      Hallazgo: «La versión móvil tiene un menú que ocupa gran parte de la parte superior». Hoy la cabecera es una columna: nombre + 5 enlaces que se reparten en 2 o 3 filas.
      Tensión con PU-01: el menú tiene que seguir viéndose. Propuesta (a confirmar por Francisco): una sola fila de pestañas con desplazamiento horizontal (overflow-x: auto, scroll-snap) y degradado en el borde que indica que hay más, en lugar de un menú hamburguesa que lo escondería.
  - [ ] Menú en una sola fila desplazable con la página actual centrada al cargar (scrollIntoView en main.js) y degradado de «hay más» @est:2.5h @owner:francisco ^T74
        Sin JavaScript sigue funcionando (fila desplazable). Reducir el padding de la cabecera. Objetivo: cabecera ≤ 2 filas (≈ 100 px) a 360 px de ancho.
  - [ ] Medir el alto de la cabecera antes/después a 320, 360 y 414 px y comprobar foco con teclado y lector de pantalla @est:1h @owner:francisco @dep:T74 ^T75

## Contenidos

- [ ] PU-02 Renombrar la página «Proyectos» a «Conocimientos y Proyectos» («Skills & Projects» en EN) @owner:francisco @prio:high #usabilidad #contenidos ^T76
      Hallazgo: le costó encontrar el contenido porque no guardaba relación semántica con el título «Proyectos» (la página contiene formación, experiencia y stack tecnológico).
      Supuesto a confirmar: se conserva el nombre de archivo proyectos.html para no romper enlaces externos; solo cambia el texto visible. El h1 actual es «Credenciales y proyectos».
  - [ ] Cambiar menú, <title>, h1, migas de pan, meta description y enlaces del carrusel en las 14 páginas ES y EN y en 404 @est:1.5h @owner:francisco ^T77
        Revisar también los textos del JS que leen el <title> (vistas previas de EV-01) y la etiqueta en ‹ › del carrusel. Comprobar que el texto más largo cabe en el menú móvil (PU-06).
  - [ ] Regenerar el índice de búsqueda (tools/build-search-index.py → search-index.js) y actualizar la Ayuda ES y EN @est:1h @owner:francisco @dep:T77 ^T78
        Ojo: search.js y build-search-index.py tienen cambios sin commitear en el árbol de trabajo.

## Accesibilidad y ayuda

- [ ] PU-03 Indicar en móvil que se puede pasar de página deslizando el dedo a izquierda y derecha @est:3h @owner:francisco #usabilidad #movil #ayuda ^T79
      Hallazgo: no se dio cuenta de que se podía deslizar hasta hacerlo sin querer. El gesto existe desde EV-01 (T55, main.js, touchstart/touchend) pero no se anuncia.
      Propuesta: aviso breve «Desliza ← → para cambiar de página» con icono de mano, solo en pantallas táctiles ≤768 px y solo las primeras visitas (localStorage, con try/catch); se cierra con un botón o al deslizar. Con prefers-reduced-motion, sin animación del icono.
      Además, un texto fijo pequeño junto a los botones del carrusel inferior («o desliza») y una entrada en la Ayuda ES y EN. Sin JavaScript no se muestra (el gesto no existe).
- [ ] PU-04 Ajuste de accesibilidad para aumentar o reducir el tamaño de letra @owner:francisco @dep:T70,T73 @prio:high #accesibilidad #usabilidad ^T80
      Hallazgo: le costó leer partes de la web desde el teléfono (vista cansada).
      Todos los font-size del CSS van en rem, así que basta con cambiar el font-size de <html>. Niveles propuestos: 87,5 %, 100 %, 112,5 %, 125 %, 150 %.
  - [ ] Control «A− / A / A+» en .header-tools con nombres accesibles, aria-disabled en los extremos y anuncio del nivel en una región aria-live @est:2h @owner:francisco ^T81
        Textos ES y EN. Sin JavaScript el control no se muestra (queda el zoom del navegador). Áreas táctiles de 44 px.
  - [ ] Guardar el nivel en localStorage y aplicarlo en el script del <head> antes del primer pintado (sin parpadeo ni CLS) @est:1h @owner:francisco @dep:T81 ^T82
        Añadirlo al script en línea que ya existe en el <head> de las 14 páginas (data-enter / data-previews).
  - [ ] Revisar el diseño a 150 % en 320, 768 y 1280 px: cabecera, carrusel, vistas previas laterales (medidas en px) y tagline @est:1.5h @owner:francisco @dep:T82 ^T83
        WCAG 1.4.4 y 1.4.10: sin pérdida de contenido ni scroll horizontal.
  - [ ] Documentar el ajuste en la Ayuda ES y EN @est:0.5h @owner:francisco @dep:T83 ^T84

## Pruebas y cierre

- [ ] PU-07 Verificación final de la tanda 2: validación W3C, Lighthouse (CLS, LCP), teclado, lector de pantalla y repetición de las tareas de la prueba de usabilidad @est:3h @owner:francisco @dep:T76,T79,T80 #pruebas ^T85
      Ejecutar tests/w3c-validate.js y tests/prueba-usabilidad.ps1. Probar en móvil, tableta y escritorio reales.
      Actualizar Checklist-Auditoria.md con una entrada por ticket PU-01…PU-06.
