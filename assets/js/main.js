/* ==========================================================================
   Sitio web personal — Navegación del carrusel

   Los puntos y enlaces activos se marcan de forma estática en cada página
   (progressive enhancement: la web funciona sin JavaScript). Los enlaces
   ‹ › del carrusel y las flechas laterales son <a> normales con el bucle ya
   escrito en el HTML (Inicio ‹ Galería y Galería › Inicio). Este script
   añade el atajo de teclado ← → con el mismo bucle, el formulario por AJAX,
   y en EV-01 las vistas previas laterales y el deslizamiento entre páginas.
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

  // ── Deslizamiento entre páginas (EV-01) ──────────────────────────────
  // Al ir a la página anterior o a la siguiente, el contenido sale hacia el
  // lado contrario y después se navega a la página real (sin pushState). La
  // dirección se guarda en sessionStorage y el script del <head> de la
  // página nueva la aplica antes del primer pintado (data-enter), para que
  // entre por el lado correcto. Con prefers-reduced-motion se navega sin más.
  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var root = document.documentElement;

  function slideTo(url, dir) {
    if (!url) return;
    if ((reduceMotion && reduceMotion.matches) || root.hasAttribute('data-slide')) {
      if (!root.hasAttribute('data-slide')) window.location.href = url;
      return;
    }
    try {
      window.sessionStorage.setItem('slide-enter', dir);
    } catch (error) { /* sin almacenamiento: la página nueva entra como siempre */ }
    var page = document.querySelector('main');
    var left = false;
    var leave = function () {
      if (left) return;
      left = true;
      window.location.href = url;
    };
    root.setAttribute('data-slide', dir);
    if (page) page.addEventListener('animationend', leave);
    window.setTimeout(leave, 400); // por si la animación no llega a lanzarse
  }

  // Al volver con «Atrás», el navegador puede restaurar la página tal como
  // se quedó (bfcache): se quita el estado de salida para que se vea.
  window.addEventListener('pageshow', function () {
    root.removeAttribute('data-slide');
  });

  // Al pasar de la última página se vuelve a la primera y al revés (bucle),
  // igual que en los enlaces del HTML.
  function goTo(nextIndex) {
    var total = PAGES.length;
    slideTo(PAGES[((nextIndex % total) + total) % total].url, nextIndex < index ? 'prev' : 'next');
  }

  // Clic normal (botón principal, sin teclas modificadoras): con Ctrl, Cmd,
  // Mayús o la rueda el enlace se abre en otra pestaña como siempre.
  function slideOnClick(link, dir) {
    if (!link) return;
    link.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      slideTo(link.href, dir);
    });
  }

  // El atajo solo existe con JavaScript: aquí se anuncia, con la pista
  // visible junto al carrusel y con aria-keyshortcuts en los enlaces ‹ ›.
  var hint = document.getElementById('carousel-hint');
  var prevLink = document.getElementById('btn-prev');
  var nextLink = document.getElementById('btn-next');
  if (hint) hint.hidden = false;
  if (prevLink) prevLink.setAttribute('aria-keyshortcuts', 'ArrowLeft');
  if (nextLink) nextLink.setAttribute('aria-keyshortcuts', 'ArrowRight');
  slideOnClick(prevLink, 'prev');
  slideOnClick(nextLink, 'next');

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

  // ── Vistas previas laterales (EV-01) ──────────────────────────────────
  // En pantallas de 1200 px o más, las flechas laterales muestran la página
  // anterior y la siguiente en miniatura. Se leen con fetch después del
  // evento load, para no competir con la carga de la página actual, y se
  // clonan sin imágenes, vídeos ni audio: en su lugar quedan cajas con las
  // proporciones de width/height. El clon es decorativo (aria-hidden, inert)
  // y el enlace conserva su aria-label. Sin fetch (por ejemplo con file://)
  // las flechas siguen como estaban.
  var lateral = document.querySelectorAll('.page-lateral-nav a');
  if (lateral.length === 2) {
    slideOnClick(lateral[0], 'prev');
    slideOnClick(lateral[1], 'next');
  }
  var wide = window.matchMedia ? window.matchMedia('(min-width: 1200px)') : null;
  var PREVIEW_WIDTH = 960; // ancho real de .page, que la miniatura reduce
  var previewsRequested = false;

  // «Proyectos · Francisco Cimadevilla» → «Proyectos»
  function pageName(doc) {
    var parts = doc.title.split('·');
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].replace(/^\s+|\s+$/g, '');
      if (part && part !== 'Francisco Cimadevilla') return part;
    }
    return '';
  }

  function replaceWith(old, replacement) {
    old.parentNode.replaceChild(replacement, old);
  }

  // Deja el <main> vecino listo para mostrarse como miniatura. Se hace
  // dentro del documento de DOMParser, que no descarga nada: si las <img>
  // llegaran al documento real, empezarían a descargarse.
  function stripPreview(page) {
    var i;
    var doc = page.ownerDocument;
    // Multimedia → cajas con las mismas proporciones (sin descargar nada).
    var media = page.querySelectorAll('picture, img, video, audio, iframe');
    for (i = 0; i < media.length; i++) {
      var el = media[i];
      if (!page.contains(el)) continue; // la <img> de un <picture> ya sustituido
      var size = el.tagName === 'PICTURE' ? el.querySelector('img') : el;
      var box = doc.createElement('span');
      box.className = 'page-preview-media';
      var w = size && size.getAttribute('width');
      var h = size && size.getAttribute('height');
      if (w && h) {
        box.style.width = w + 'px';
        box.style.aspectRatio = w + ' / ' + h;
      } else {
        box.style.height = '3.5rem';
      }
      replaceWith(el, box);
    }
    // Sin scripts, sin enlaces anidados dentro del enlace y sin ids repetidos.
    var scripts = page.querySelectorAll('script, noscript');
    for (i = 0; i < scripts.length; i++) scripts[i].parentNode.removeChild(scripts[i]);
    var links = page.querySelectorAll('a');
    for (i = 0; i < links.length; i++) {
      var span = doc.createElement('span');
      span.className = links[i].className;
      while (links[i].firstChild) span.appendChild(links[i].firstChild);
      replaceWith(links[i], span);
    }
    var all = page.querySelectorAll('[id], [for], [aria-labelledby], [aria-describedby], [tabindex]');
    for (i = 0; i < all.length; i++) {
      all[i].removeAttribute('id');
      all[i].removeAttribute('for');
      all[i].removeAttribute('aria-labelledby');
      all[i].removeAttribute('aria-describedby');
      all[i].removeAttribute('tabindex');
    }
  }

  // La miniatura mide lo que su marco: escala = ancho del marco / 960 px.
  function scalePreviews() {
    var frames = document.querySelectorAll('.page-preview-frame');
    for (var i = 0; i < frames.length; i++) {
      var scale = frames[i].clientWidth / PREVIEW_WIDTH;
      if (scale > 0) frames[i].firstChild.style.transform = 'scale(' + scale + ')';
    }
  }

  function buildPreview(link, isPrev) {
    window.fetch(link.href)
      .then(function (response) {
        if (!response.ok) throw new Error(response.status);
        return response.text();
      })
      .then(function (html) {
        var doc = new window.DOMParser().parseFromString(html, 'text/html');
        var main = doc.querySelector('main');
        if (!main) return;
        var name = pageName(doc);

        stripPreview(main);
        var page = document.createElement('div');
        page.className = 'page-preview-page';
        page.setAttribute('inert', '');
        while (main.firstChild) page.appendChild(document.adoptNode(main.firstChild));

        var preview = document.createElement('span');
        preview.className = 'page-preview';
        preview.setAttribute('aria-hidden', 'true');
        var title = document.createElement('span');
        title.className = 'page-preview-title';
        title.textContent = isPrev ? '‹ ' + name : name + ' ›';
        var frame = document.createElement('span');
        frame.className = 'page-preview-frame';
        frame.appendChild(page);
        preview.appendChild(title);
        preview.appendChild(frame);

        // La flecha se queda para las anchuras sin vista previa.
        var arrow = document.createElement('span');
        arrow.className = 'page-lateral-arrow';
        arrow.textContent = link.textContent;
        link.textContent = '';
        link.appendChild(arrow);
        link.appendChild(preview);
        link.setAttribute('data-preview', '');
        scalePreviews();
      })
      .catch(function () { /* sin vista previa: queda la flecha */ });
  }

  function requestPreviews() {
    if (previewsRequested || !wide || !wide.matches) return;
    previewsRequested = true;
    for (var i = 0; i < lateral.length; i++) buildPreview(lateral[i], i === 0);
  }

  if (lateral.length === 2 && wide && window.fetch && window.DOMParser) {
    var whenLoaded = function () {
      requestPreviews();
      // Si la ventana se ensancha más tarde, se construyen entonces.
      if (wide.addEventListener) wide.addEventListener('change', requestPreviews);
      else if (wide.addListener) wide.addListener(requestPreviews);
    };
    if (document.readyState === 'complete') whenLoaded();
    else window.addEventListener('load', whenLoaded);

    var resizeQueued = false;
    window.addEventListener('resize', function () {
      if (resizeQueued) return;
      resizeQueued = true;
      window.requestAnimationFrame(function () {
        resizeQueued = false;
        scalePreviews();
      });
    });
  }
})();