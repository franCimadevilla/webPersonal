/* ==========================================================================
   Sitio web personal — Navegación del carrusel

   Los puntos y enlaces activos se marcan de forma estática en cada página
   (progressive enhancement: la web funciona sin JavaScript). Este script
   solo controla los botones ‹ › y el atajo de teclado.
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

  var prevBtn = document.getElementById('btn-prev');
  var nextBtn = document.getElementById('btn-next');

  function goTo(nextIndex) {
    if (nextIndex < 0 || nextIndex >= PAGES.length) return;
    window.location.href = PAGES[nextIndex].url;
  }

  // Configurar botón anterior
  if (prevBtn) {
    if (index > 0) {
      prevBtn.addEventListener('click', function () { goTo(index - 1); });
    } else {
      prevBtn.addEventListener('click', function () { goTo(PAGES.length - 1); });
    }
  }

  // Configurar botón siguiente
  if (nextBtn) {
    if (index < PAGES.length - 1) {
      nextBtn.addEventListener('click', function () { goTo(index + 1); });
    } else {
      nextBtn.addEventListener('click', function() { goTo(0);  });
    }
  }

  // Atajo de teclado: flechas izquierda/derecha para desplazarse
  document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === 'ArrowRight' && index < PAGES.length - 1) {
      event.preventDefault();
      goTo(index + 1);
    }
  });
})();