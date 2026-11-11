# M6 – Eficiencia

id: M6
status: planned

Mejoras de la categoría 6 (métricas 6.1 y 6.2).

## 6.1 Rendimiento

- [x] EF-01 Optimizar las 6 fotos de la galería (≈21 MB a < 1,5 MB) @owner:francisco @prio:high @started:2026-11-11 @done:2026-11-11 ^T43
      Fuente: C, M, J, I, S. Métricas: 6.1, 6.2, 1.4. Galería: Lighthouse 75, LCP 36,5 s, CLS 0,056. Guardar los originales fuera del repositorio.
  - [x] Redimensionar (≤1600 px) y convertir a WebP/AVIF con JPEG ligero de respaldo @est:1.5h @owner:francisco @started:2026-11-11 @done:2026-11-11 ^T44
  - [x] galeria.html con <picture>, width/height y loading=lazy salvo la primera imagen (fetchpriority alta) @est:1.5h @owner:francisco @dep:T44 @done:2026-11-11 ^T45
- [x] EF-02 Optimizar los 4 vídeos (≈27 MB a < 8 MB) @owner:francisco @prio:high @done:2026-11-11 ^T46
      Fuente: C (28 MB de vídeos), S (reproductor con miniatura, en 1.3). Métricas: 6.1, 6.2, 1.3. Los 4 clips suman ≈27 MB; el tfg-clip pesa 14,7 MB.
  - [x] Recodificar los clips (H.264 720p, CRF≈28, faststart) @est:1.5h @owner:francisco @done:2026-11-11 ^T47
  - [x] Añadir poster, preload="none" y width/height a cada <video> @est:1h @owner:francisco @dep:T47 @done:2026-11-11 ^T48
- [x] EF-03 Sustituir el Typing SVG externo por una animación CSS propia con texto real @est:2.5h @owner:francisco @prio:high @started:2026-11-11 @done:2026-11-11 ^T49
      Fuente: C, M, J, S (I la valora en 1.3: mantener el efecto). Métricas: 6.2, 6.1, 2.2, 1.3, 5.1. Quita la dependencia de readme-typing-svg (~2 s), el alt «Typing SVG» y el recorte «Softw»; respetar prefers-reduced-motion.

## 6.2 Tiempo de carga

- [ ] EF-04 Remedir con PageSpeed Insights (móvil) y Lighthouse y registrar antes/después @est:2h @owner:francisco @dep:T45,T48,T49,T12,T26,T56 @prio:high ^T50
      Fuente: C, M, J, I. Métricas: 6.1, 6.2, 1.4. Objetivo: Rendimiento ≥ 90 en todas las páginas, LCP < 2,5 s y CLS < 0,1. Las 5 páginas llevan un script de Contentsquare sin commitear: medir con y sin él.
