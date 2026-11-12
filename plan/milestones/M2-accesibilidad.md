# M2 – Accesibilidad

id: M2
status: planned

Mejoras de la categoría 2 (métricas 2.1–2.3).

## 2.1 Solo teclado

- [x] AC-01 Enlace «Saltar al contenido» en las 5 páginas @est:1h @owner:francisco @prio:high @done:2026-11-11 ^T14
      Fuente: M, S. Métrica: 2.1. Requiere id en <main>.
- [ ] AC-02 Estilo :focus-visible propio y consistente @est:1h @owner:francisco ^T15
      Fuente: S (C y M validan el foco del navegador). Métrica: 2.1.
- [x] AC-03 Atajo ← → seguro: ignorar Alt/Ctrl/Mayús/Meta y el foco en vídeo, audio e inputs @est:1.5h @owner:francisco @started:2026-11-12 @done:2026-11-12 ^T16
      Fuente: C (choca con lectores de pantalla). Métrica: 2.1. Observación al revisar main.js: Alt+← (atrás del navegador) y las flechas sobre <video controls>/<audio> cambian de página.

## 2.2 Sin elementos gráficos

- [ ] AC-04 Emojis decorativos con aria-hidden @est:0.5h @owner:francisco @prio:low ^T17
      Fuente: S (lo pide en 1.3). Métricas: 1.3, 2.2.
- [ ] AC-05 Subtítulos y transcripción de los contenidos multimedia @owner:francisco @prio:low ^T18
      Fuente: S. Métrica: 2.2.
  - [ ] Comprobar qué vídeos tienen audio y añadir <track kind="captions"> (WebVTT) @est:3h @owner:francisco @dep:T48 ^T19
  - [ ] Transcripción del podcast (texto en la página) @est:2h @owner:francisco ^T20

## 2.3 Comprobación automática

- [ ] AC-06 Auditar con Lighthouse, WAVE y axe las páginas ES y EN y resolver avisos @est:2.5h @owner:francisco @dep:T12,T26,T15,T16,T28,T56 @prio:high ^T21
      Fuente: J (WAVE: posible encabezado y enlace repetido), S. Métrica: 2.3. Sospecha: .site-brand es un <p> con estilo de título. Los enlaces repetidos se resuelven con FU-04.
- [ ] AC-07 Prueba manual: solo teclado, NVDA e imágenes/CSS desactivados @est:2h @owner:francisco @dep:T21 ^T22
      Fuente: C, M, J, I (método de prueba). Métricas: 2.1, 2.2, 2.3. Documentar el resultado.
