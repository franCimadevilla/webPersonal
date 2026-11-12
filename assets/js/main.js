/* ==========================================================================
   Sitio web personal — Navegación del carrusel

   Los puntos y enlaces activos se marcan de forma estática en cada página
   (progressive enhancement: la web funciona sin JavaScript). Los enlaces
   ‹ › del carrusel y las flechas laterales son <a> normales con el bucle ya
   escrito en el HTML (Inicio ‹ Galería y Galería › Inicio). Este script solo
   añade el atajo de teclado ← →, con el mismo bucle.
   ========================================================================== */

(function () {
  'use strict';

  // Orden de las páginas del carrusel
  var PAGES = [
    { id: 'home',       url: 'index.html' },
    { id: 'sobre-mi',   url: 'sobre-mi.html' },
    { id: 'proyectos',  url: 'proyectos.html' },
    { id: 'multimedia', url: 'multimedia.html' },
    { id: 'galeria',    url: 'galeria.html' },
  ];

  var currentId = document.body.getAttribute('data-page') || 'home';
  var index = PAGES.findIndex(function (page) { return page.id === currentId; });
  if (index === -1) index = 0;

  // Al pasar de la última página se vuelve a la primera y al revés (bucle),
  // igual que en los enlaces del HTML.
  function goTo(nextIndex) {
    var total = PAGES.length;
    window.location.href = PAGES[((nextIndex % total) + total) % total].url;
  }

  // Elementos que usan las flechas por sí mismos: campos de texto, listas,
  // controles de rango y reproductores. Ahí el atajo no debe actuar.
  var OWN_ARROWS = 'input, textarea, select, video, audio, [contenteditable], [role="slider"], [role="listbox"], [role="menu"], [role="tablist"]';

  function shortcutAllowed(event) {
    // Alt+← es «atrás» en el navegador y Ctrl/Mayús/Meta+flecha seleccionan
    // texto o saltan palabras: con cualquier modificador, no se navega.
    if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) return false;
    if (event.defaultPrevented || event.isComposing) return false;
    var target = event.target;
    return !(target && target.closest && target.closest(OWN_ARROWS));
  }

  // Atajo de teclado: flechas izquierda/derecha para desplazarse
  document.addEventListener('keydown', function (event) {
    if (!shortcutAllowed(event)) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(index + 1);
    }
  });
})();