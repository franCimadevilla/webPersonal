# M5 – Confiabilidad

id: M5
status: planned

Mejoras de la categoría 5 (métricas 5.1–5.4).

## 5.1 Deficiencias y errores

- [x] CF-01 Texto del enlace a LinkedIn (in/franciscoc-cimadevilla ≠ href francisco-cimadevilla) y unificar el texto visible de GitHub @est:0.5h @owner:francisco @prio:high @done:2026-11-11 ^T36
      Fuente: J. Métricas: 5.1, 1.6.
- [x] CF-02 Errata «NotebookLLM» → «NotebookLM» y pie de foto mezclado «Neuschwanstein Castle» → «Castillo de Neuschwanstein» @est:0.5h @owner:francisco @done:2026-11-11 ^T37
      Fuente: S. Métrica: 5.1.
- [ ] CF-07 Revisar enlaces internos y externos tras los cambios (ES y EN) @est:1h @owner:francisco @dep:T12,T26,T35,T56 ^T38
      Fuente: C (comprobó los externos). Métrica: 5.1.

## 5.2 y 5.3 Validación HTML y CSS

- [x] CF-05 Quitar reglas CSS sin uso con pointer-events y revisar los avisos del validador @est:1.5h @owner:francisco @started:2026-11-12 @done:2026-11-12 ^T39
      Fuente: J (2 errores pointer-events), C, I (1 aviso). Métrica: 5.3. Observación: ningún elemento usa disabled ni aria-disabled, así que .carousel-btn:disabled y .page-lateral-nav [aria-disabled] sobran.
- [ ] CF-06 Revalidar HTML y CSS en el W3C (ES y EN) y guardar la evidencia @est:2h @owner:francisco @dep:T21,T39,T41 @prio:high ^T40
      Fuente: S (pide el resultado pegado); C, M, J, I ya dan 0 errores. Métricas: 5.2, 5.3. Se puede usar tests/w3c-validate.js.

## 5.4 Fecha de última actualización

- [x] CF-03 «Última actualización: dd/mm/aaaa» con <time> en el pie de todas las páginas @est:1h @owner:francisco @prio:high @done:2026-11-11 ^T41
      Fuente: C, M, J, I, S (media 1,4). Métrica: 5.4.
- [ ] CF-04 Automatizar la fecha con la del último commit en el workflow de Pages @est:1.5h @owner:francisco @dep:T41 @prio:low ^T42
      Opcional. Evita que la fecha quede obsoleta.
