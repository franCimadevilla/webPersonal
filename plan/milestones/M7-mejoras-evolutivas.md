# M7 – Mejoras evolutivas

id: M7
status: planned

Mejoras que no salen de la auditoría sino de una petición de Francisco. Detalle en la sección 6 de Checklist-Auditoria.md.

## Carrusel con vistas previas

- [x] EV-01 Carrusel con vistas previas laterales y deslizamiento (efecto de la tienda de Steam) @owner:francisco @started:2026-11-12 @done:2026-11-12 ^T51
      Petición propia. Métricas que toca: 1.1, 1.3, 3.2 (mejora) y 1.4, 2.1, 2.3, 6.1 (a vigilar). Las vistas previas sustituyen a las flechas laterales fijas desde ≈1200 px; entre 769 y 1199 px y sin JavaScript se conservan las flechas actuales.
  - [x] Leer las páginas vecinas con fetch tras el evento load y construir el clon sin multimedia (sin id, aria-hidden, inert, cajas con las proporciones de width/height) @est:4h @owner:francisco @dep:T27,T28,T16,T8,T45,T12 @started:2026-11-12 @done:2026-11-12 ^T52
        Los textos del JS («Anterior», «Siguiente») van en ES y EN según <html lang>. El título de cada vista previa sale del <title> de la página vecina.
  - [x] CSS de las vistas previas: miniatura escalada y recortada, título en tamaño normal, enlace real con nombre accesible y reemplazo de .page-lateral-nav desde ≈1200 px @est:3h @owner:francisco @dep:T52 @started:2026-11-12 @done:2026-11-12 ^T53
        Hueco lateral ≈ (ancho − 960) / 2: 160 px a 1280, 203 px a 1366, 240 px a 1440.
  - [x] Deslizamiento al hacer clic en la vista previa, en los botones ‹ › o con ← →, y entrada de la página nueva por el lado correcto; sin animación con prefers-reduced-motion @est:3h @owner:francisco @dep:T53 @started:2026-11-12 @done:2026-11-12 ^T54
        Guardar la dirección en sessionStorage. Comprobar que se aplica antes del primer pintado; si no, hace falta un script mínimo en <head> en las páginas ES y EN. Hoy slide-in siempre entra desde la derecha.
  - [x] Deslizar con el dedo en móvil (≤768 px): umbral, predominio horizontal, sin activarse sobre vídeo, audio ni controles de rango @est:2.5h @owner:francisco @dep:T54 @started:2026-11-12 @done:2026-11-12 ^T55
        touch-action: pan-y para no bloquear el scroll vertical. No iniciar el gesto en los ~20 px del borde (gesto «átrás» del sistema). Los botones siguen siendo la alternativa de un solo toque.
  - [x] Probar a 1280, 1366 y 1920 px, en móvil real, sin JavaScript y con file:// ; medir CLS y LCP en las 5 páginas @est:2h @owner:francisco @dep:T55 @started:2026-11-12 @done:2026-11-12 ^T56
        Con file:// las vistas previas no aparecen (fetch bloqueado) y la web debe seguir funcionando.
- [ ] EV-02 Ajustes de las vistas previas laterales: altura del viewport, capa de blur, 1/4 de la página y transición por desplazamiento @owner:francisco ^T58
      Petición de Francisco del 2026-11-12 sobre EV-01 (T51). Solo desde 1200 px; por debajo, sin JavaScript y con file:// siguen las flechas actuales.
      Supuestos que debe confirmar Francisco antes de empezar: (a) «1/4 de la página» = la cuarta parte del ancho de la página vecina, la que queda junto a la actual (como las diapositivas vecinas que asoman en un carrusel); (b) la vista previa ocupa toda la altura de la ventana, también bajo la cabecera y el pie; (c) el título de la página vecina se mantiene, por encima del blur; (d) en la transición, la vista previa se desplaza hasta el centro y ocupa el sitio de la página actual.
  - [ ] Vista previa a toda la altura del viewport (100vh/100dvh) en lugar del marco 3:4 con tope de 60vh @est:2h @owner:francisco @dep:T56 ^T59
        Quitar aspect-ratio y max-height de .page-preview-frame; la franja ya va de arriba abajo (position: fixed; top: 0; bottom: 0).
        Decidir cómo convive con la cabecera y el pie (z-index 50): la vista previa pasa por debajo o empieza bajo la cabecera. Mantener el área táctil y el anillo de foco del enlace en toda la franja.
        Título: superpuesto arriba o centrado, siempre legible. Sin CLS: el hueco ya lo reserva el script del <head> (data-previews).
  - [ ] Mostrar solo 1/4 de la página vecina: la franja junto a la página actual (izquierda: cuarto derecho de la anterior; derecha: cuarto izquierdo de la siguiente) @est:3h @owner:francisco @dep:T59 ^T60
        La miniatura deja de verse entera: escala = ancho del hueco / 240 px (un cuarto de 960). Por ejemplo 0,67 a 1280, 0,85 a 1366 y 2 a 1920. Habrá que decidir un tope (¿1?) para no ampliar la página.
        scalePreviews() en main.js calcula la escala y alinea la miniatura al borde interior con transform-origin top right (izquierda) o top left (derecha), según el lado.
        Revisar el clon en las 5 páginas: con más escala se leen los textos y se ven más las cajas grises de multimedia. Probar a 1280, 1366 y 1920 px.
  - [ ] Capa de blur sobre la vista previa para difuminar el contenido, con el título nítido por encima @est:2h @owner:francisco @dep:T60 ^T61
        Capa (pseudo-elemento o <span>) con backdrop-filter: blur() o filter: blur() sobre .page-preview-page; quizá un degradado hacia el borde exterior para que se funda con el fondo.
        Plan B si no hay backdrop-filter: capa semitransparente. El título por encima del blur debe tener contraste ≥ 4,5:1.
        Medir el coste: un blur que ocupa toda la altura en dos franjas puede pesar en GPU al hacer scroll y durante la transición (T62). Comprobar fluidez y que el hover no lo recalcule.
  - [ ] Transición por desplazamiento: al navegar, la página actual sale hacia un lado y la vista previa se desplaza hasta el centro (efecto carrusel) antes de cargar la página nueva @est:4h @owner:francisco @dep:T60 ^T62
        Sustituye la salida actual (fundido + 80 px). Al hacer clic en la vista previa, en ‹ › o con ← → (y el gesto táctil en móvil, sin vista previa), .page se traslada un ancho completo hacia el lado contrario y la vista previa viaja del hueco al centro, quitando el blur y pasando a escala 1 (técnica FLIP con transform, sin animar width/left).
        La página nueva tiene que empezar donde terminó la animación, sin salto: su contenido ya está en el centro (entrada sin desplazamiento o muy corta), y las nuevas vistas previas aparecen después.
        Mantener: prefers-reduced-motion (sin animación), clics con Ctrl/Cmd/Mayús, temporizador de respaldo, bfcache (pageshow) y data-enter del <head>. La miniatura del lado contrario se desplaza también hacia fuera.
  - [ ] Pruebas de EV-02: 1280, 1366 y 1920 px, CLS y fluidez, movimiento reducido, sin JavaScript, file://, teclado y foco @est:2h @owner:francisco @dep:T61,T62 ^T63
        CLS debe seguir en 0. Medir los fotogramas de la animación y del scroll con el blur (DevTools > Performance) y que LCP no empeore.
        Revisar que el anillo de foco se vea sobre el blur. Actualizar la sección 6 del checklist y, si cambia el comportamiento, la Ayuda (ES y EN). Probar en un navegador real, porque headless no hace avanzar las animaciones CSS.
