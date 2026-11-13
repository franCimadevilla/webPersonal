# M3 – Funcionalidad

id: M3
status: planned

Mejoras de la categoría 3 (métricas 3.1 y 3.2).

## 3.1 Buscador

- [x] FU-01 Buscador del sitio (propio, sin dependencias; sustituye a Pagefind) @owner:francisco @prio:high @started:2026-11-12 @done:2026-11-12 ^T23
      Fuente: C, M, J, I, S (todos 0). Pagefind indexa en el workflow de Pages y funciona en GitHub Pages sin servidor.
      2026-11-12: Pagefind es una dependencia externa (binario en el workflow y su JS en la web), y las reglas del proyecto no permiten añadirlas. Se sustituye por un índice propio generado con Python y una búsqueda en JS ES5, también sin servidor.
  - [x] Índice de búsqueda propio generado con Python, regenerado en el workflow de Pages y probado en local @est:3h @owner:francisco @started:2026-11-12 @done:2026-11-12 ^T24
  - [x] Caja de búsqueda accesible en la cabecera y página de resultados con aria-live @est:4h @owner:francisco @dep:T24,T11 @started:2026-11-12 @done:2026-11-12 ^T25
  - [x] Estilos, mensaje «sin resultados» y pruebas en ES/EN @est:2h @owner:francisco @dep:T25 @done:2026-11-12 ^T26

## 3.2 Facilidad de navegación

- [x] FU-02 Flechas y botones del carrusel con el destino en el texto («Anterior: Proyectos») @est:2h @owner:francisco @started:2026-11-12 @done:2026-11-12 ^T27
      Fuente: S (C y J piden etiquetas claras). Métricas: 3.2, 1.2.
- [x] FU-03 Prev/next unificado con bucle en teclado, flechas laterales y botones @est:1h @owner:francisco @prio:high @done:2026-11-11 ^T28
      Fuente: C, S (S ve un error en que « › » de Galería lleve a Inicio; se mantiene el bucle y se etiqueta el destino en FU-02). Métricas: 3.2, 2.1, 5.1. Hoy el teclado no hace bucle y los botones sí.
- [x] FU-04 Contexto en enlaces repetidos («Repositorio de BasaltDB») con texto oculto visualmente @est:1.5h @owner:francisco @started:2026-11-12 @done:2026-11-12 ^T29
      Fuente: S, J (WAVE: enlace repetido). Métricas: 3.2, 2.3. Tarjetas de Proyectos.
