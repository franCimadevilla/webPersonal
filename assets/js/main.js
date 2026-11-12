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

  // El atajo solo existe con JavaScript: aquí se anuncia, con la pista
  // visible junto al carrusel y con aria-keyshortcuts en los enlaces ‹ ›.
  var hint = document.getElementById('carousel-hint');
  var prevLink = document.getElementById('btn-prev');
  var nextLink = document.getElementById('btn-next');
  if (hint) hint.hidden = false;
  if (prevLink) prevLink.setAttribute('aria-keyshortcuts', 'ArrowLeft');
  if (nextLink) nextLink.setAttribute('aria-keyshortcuts', 'ArrowRight');

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

  // Formulario de contacto (US-06). Sin JavaScript se envía de forma normal
  // y FormSubmit muestra su página de confirmación. Con JavaScript se envía
  // a su punto AJAX y la confirmación aparece aquí, en una región role=status.
  // Los textos dependen del idioma de la página (<html lang>): la versión
  // inglesa en /en/ usa este mismo script.
  var TEXT = document.documentElement.lang === 'en' ? {
    sending: 'Sending…',
    ok: 'Thank you, your message has been sent. I will reply as soon as I can.',
    error: 'The message could not be sent. Please try again or write to me at cimadevilla.francisco@gmail.com.'
  } : {
    sending: 'Enviando…',
    ok: 'Gracias, tu mensaje se ha enviado. Te responderé lo antes posible.',
    error: 'No se ha podido enviar el mensaje. Inténtalo de nuevo o escríbeme a cimadevilla.francisco@gmail.com.'
  };

  var form = document.getElementById('contact-form');
  var status = document.getElementById('contact-status');
  if (form && status && window.fetch && window.FormData) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var button = form.querySelector('[type="submit"]');
      button.disabled = true;
      status.className = 'contact-status';
      status.textContent = TEXT.sending;
      fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (String(data.success) !== 'true') throw new Error(data.message);
          form.reset();
          status.className = 'contact-status is-ok';
          status.textContent = TEXT.ok;
        })
        .catch(function () {
          status.className = 'contact-status is-error';
          status.textContent = TEXT.error;
        })
        .then(function () { button.disabled = false; });
    });
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