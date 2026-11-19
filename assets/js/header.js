/* ==========================================================================
   Sitio web personal — Cabecera (todas las páginas)

   PU-04: control «Tamaño del texto». El nivel elegido se guarda en
   localStorage y el script en línea del <head> lo aplica antes del primer
   pintado (style="font-size" en <html>), así que no hay parpadeo al cambiar
   de página. Todos los tamaños del CSS van en rem: crecen con él.

   PU-06: en el móvil el menú es una sola fila que se desliza de lado. Aquí
   se centra la pestaña de la página actual y se indica con data-more en
   qué lado quedan más pestañas (el CSS pone ahí el degradado).

   Se carga también en ayuda.html, buscar.html y 404.html, que no cargan
   main.js (allí no hay carrusel).
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'text-size';
  var LEVELS = [87.5, 100, 112.5, 125, 150];

  // ── Tamaño del texto (PU-04) ─────────────────────────────────────────
  var toggle = document.querySelector('.text-size-toggle');
  var panel = document.getElementById('text-size-panel');

  function currentLevel() {
    var value = parseFloat(root.style.fontSize);
    return LEVELS.indexOf(value) === -1 ? 100 : value;
  }

  function formatLevel(value) {
    // 112.5 → «112,5 %» en español, «112.5%» en inglés.
    return root.lang === 'en' ? value + '%' : String(value).replace('.', ',') + ' %';
  }

  function render() {
    if (!panel) return;
    var value = currentLevel();
    var index = LEVELS.indexOf(value);
    var output = panel.querySelector('.text-size-value');
    if (output) output.textContent = formatLevel(value);
    var buttons = panel.querySelectorAll('[data-text-step]');
    for (var i = 0; i < buttons.length; i++) {
      var step = Number(buttons[i].getAttribute('data-text-step'));
      var atEnd = (step < 0 && index === 0) ||
        (step > 0 && index === LEVELS.length - 1) ||
        (step === 0 && value === 100);
      if (atEnd) buttons[i].setAttribute('aria-disabled', 'true');
      else buttons[i].removeAttribute('aria-disabled');
    }
  }

  function setLevel(value) {
    root.style.fontSize = value === 100 ? '' : value + '%';
    try {
      if (value === 100) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch (error) { /* sin almacenamiento: el cambio vale para esta página */ }
    render();
    // Las vistas previas laterales (main.js) se escalan con el ancho de su
    // marco, que va en rem: se recalculan como al cambiar el tamaño de ventana.
    window.dispatchEvent(new Event('resize'));
  }

  function openPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (toggle && panel) {
    render();

    toggle.addEventListener('click', function () {
      openPanel(panel.hidden);
    });

    panel.addEventListener('click', function (event) {
      var button = event.target.closest && event.target.closest('[data-text-step]');
      if (!button || button.getAttribute('aria-disabled') === 'true') return;
      var step = Number(button.getAttribute('data-text-step'));
      var index = LEVELS.indexOf(currentLevel());
      setLevel(step === 0 ? 100 : LEVELS[Math.min(Math.max(index + step, 0), LEVELS.length - 1)]);
    });

    // Se cierra con Escape (el foco vuelve al botón), al pulsar fuera o al
    // llevar el foco fuera con el tabulador.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) {
        openPanel(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!panel.hidden && !panel.parentNode.contains(event.target)) openPanel(false);
    });

    panel.parentNode.addEventListener('focusout', function (event) {
      if (event.relatedTarget && !panel.parentNode.contains(event.relatedTarget)) openPanel(false);
    });
  }

  // ── Cabecera en dos filas cuando no cabe en una (PU-04, PU-05) ───────
  // Desde 1200 px el nombre, el menú y las herramientas van en una fila.
  // Con la letra grande no caben y se partirían en tres: entonces el menú
  // baja a su propia fila, como en tableta. Las media queries no cambian
  // con el tamaño de letra, por eso se mide. También se ajusta el hueco que
  // dejan los anclajes bajo la cabecera fija (scroll-padding-top).
  var header = document.querySelector('.site-header');
  var nav = document.querySelector('.page-nav');
  var brand = document.querySelector('.site-brand');
  var tools = document.querySelector('.header-tools');
  var wideHeader = window.matchMedia('(min-width: 1200px)');
  var stickyHeader = window.matchMedia('(min-width: 769px)');

  function layoutHeader() {
    if (!header || !nav || !brand || !tools) return;
    header.removeAttribute('data-stacked');
    nav.removeAttribute('data-stacked');
    if (wideHeader.matches) {
      var b = brand.getBoundingClientRect();
      var n = nav.getBoundingClientRect();
      var t = tools.getBoundingClientRect();
      if (n.top >= b.bottom - 1 || t.top >= n.bottom - 1) {
        header.setAttribute('data-stacked', '');
        nav.setAttribute('data-stacked', '');
      }
    }
    root.style.scrollPaddingTop = stickyHeader.matches ? header.offsetHeight + 16 + 'px' : '';
  }

  layoutHeader();
  var layoutQueued = false;
  window.addEventListener('resize', function () {
    if (layoutQueued) return;
    layoutQueued = true;
    window.requestAnimationFrame(function () {
      layoutQueued = false;
      layoutHeader();
    });
  });

  // ── Menú desplazable en el móvil (PU-06) ─────────────────────────────
  if (!nav) return;

  function updateMore() {
    var max = nav.scrollWidth - nav.clientWidth;
    if (max <= 1) {
      nav.setAttribute('data-more', 'none');
      return;
    }
    var start = nav.scrollLeft > 1;
    var end = nav.scrollLeft < max - 1;
    nav.setAttribute('data-more', start && end ? 'both' : start ? 'start' : 'end');
  }

  // Sin scrollIntoView, que también movería la página en vertical.
  var current = nav.querySelector('[aria-current]');
  if (current && nav.scrollWidth > nav.clientWidth) {
    var item = current.parentNode.getBoundingClientRect();
    var box = nav.getBoundingClientRect();
    nav.scrollLeft += item.left - box.left - (box.width - item.width) / 2;
  }

  updateMore();
  nav.addEventListener('scroll', updateMore, { passive: true });
  window.addEventListener('resize', updateMore);
})();
