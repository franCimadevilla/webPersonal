# M1 – Usabilidad

id: M1
target: 2027-05-11
status: planned

Mejoras de la categoría 1 (métricas 1.1–1.6) de la auditoría tanda 1. Detalle y trazabilidad por auditor en Checklist-Auditoria.md.

## 1.1 Comprensibilidad global

- [x] US-01 Numeración y etiquetas coherentes del carrusel (Inicio=1 … Galería=5) @est:2h @owner:francisco @prio:high @done:2026-11-11 ^T1
      Fuente: C, J. Métricas: 1.1, 1.2, 3.2, 5.1. Hoy Inicio=«3 de 5», Sobre mí=4, Proyectos=5, Multimedia=1, Galería=2 (5 HTML × 5 puntos).
- [x] US-02 Migas de pan textuales (Inicio › Sección) en las 4 páginas interiores @est:3h @owner:francisco @started:2026-11-12 @done:2026-11-12 ^T2
      Fuente: C, M, I, S. Métrica: 1.1. <nav aria-label="Ruta de navegación"> con <ol> y aria-current en el último nivel.
- [ ] US-03 Página «Ayuda y mapa del sitio» enlazada desde el pie @est:4h @owner:francisco @dep:T28 ^T3
      Fuente: C, M, I, S. Métricas: 1.1, 1.2. Estructura del sitio, atajos de teclado y cómo contactar. Fuera del carrusel de 5 páginas.

## 1.2 Ayuda y retroalimentación

- [x] US-04 Anunciar el atajo de teclado ← → en la interfaz @est:1.5h @owner:francisco @prio:high @started:2026-11-12 @done:2026-11-12 ^T4
      Fuente: C, M. Métrica: 1.2. Pista visible junto al carrusel + aria-keyshortcuts en los botones ‹ ›.
- [ ] US-05 Página 404 propia con botón para volver al inicio @est:1.5h @owner:francisco ^T5
      Fuente: C, S. Métrica: 1.2. GitHub Pages sirve 404.html desde la raíz: usar rutas que funcionen a cualquier profundidad.
- [ ] US-06 Formulario de contacto con mensaje de confirmación @est:4h @owner:francisco ^T6
      Fuente: M, S (C lo echa en falta en 1.2). Métricas: 1.2, 4.3. Sitio estático: Formspree/Getform (externo, revisar privacidad) o formulario mailto con confirmación. Decidir antes de empezar; cancelar si no se quiere.

## 1.3 Aspectos estéticos

- [ ] US-07 Imágenes optimizadas en Sobre mí y capturas en las tarjetas de Proyectos @est:3h @owner:francisco @dep:T44 @prio:low ^T7
      Fuente: S. Métrica: 1.3. Solo WebP ligero para no empeorar el rendimiento (EF-01). Opcional.

## 1.4 Adaptabilidad a móviles

- [x] US-08 Áreas táctiles ≥ 44×44 px (puntos del carrusel, menú, botones) @est:2h @owner:francisco @started:2026-11-12 @done:2026-11-12 ^T8
      Fuente: S (revisar tamaño de botones táctiles). Métricas: 1.4, 2.1. Observación al revisar el CSS: .carousel-dot mide 12×12 px.

## 1.5 Internacionalización

- [ ] US-09 Versión en inglés con selector de idioma @owner:francisco @prio:high ^T9
      Fuente: C, M, J, I, S (media 1.5 = 0,4). Se hace al final del contenido para no traducir dos veces; carpeta /en/ con los mismos nombres de fichero.
  - [ ] Copiar las 5 páginas a /en/ y traducir textos, alt, aria-label y pies de foto @est:5h @owner:francisco @dep:T1,T2,T3,T4,T5,T6,T7,T8,T13,T14,T17,T19,T20,T27,T29,T30,T31,T32,T35,T36,T37,T41,T45,T49 ^T10
  - [ ] Selector de idioma ES/EN en la cabecera, <html lang> y enlaces hreflang @est:2h @owner:francisco @dep:T10 ^T11
  - [ ] Rutas relativas, carrusel (main.js) y 404 bilingüe funcionando bajo /en/ @est:1h @owner:francisco @dep:T11 ^T12

## 1.6 Enlaces a redes sociales

- [ ] US-10 Pie común con correo, GitHub y LinkedIn (iconos SVG + texto) en las 5 páginas @est:3h @owner:francisco ^T13
      Fuente: S (C, M, J, I puntúan 1.6 entre 7 y 10). Métricas: 1.6, 4.3. Cubre también «bloque de contacto en todas las páginas» (4.3). Otras redes solo si existen (M).
