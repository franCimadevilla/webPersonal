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

  // ── Pausa del tagline de la portada (EV-03) ──────────────────────────
  // La casilla funciona sola con CSS; aquí solo se recuerda durante la
  // visita, para que la frase no vuelva a moverse al regresar a Inicio.
  var taglinePause = document.getElementById('tagline-pause');
  if (taglinePause) {
    try {
      if (window.sessionStorage.getItem('tagline-paused') === '1') taglinePause.checked = true;
    } catch (error) { /* sin almacenamiento: la casilla funciona igual */ }
    taglinePause.addEventListener('change', function () {
      try {
        window.sessionStorage.setItem('tagline-paused', taglinePause.checked ? '1' : '0');
      } catch (error) { /* idem */ }
    });
  }

  // ── Deslizamiento entre páginas (EV-01) ──────────────────────────────
  // Al ir a la página anterior o a la siguiente, el contenido sale hacia el
  // lado contrario y después se navega a la página real (sin pushState). La
  // dirección se guarda en sessionStorage y el script del <head> de la
  // página nueva la aplica antes del primer pintado (data-enter), para que
  // entre por el lado correcto. Con prefers-reduced-motion se navega sin más.
  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var root = document.documentElement;

  // EV-02: con las vistas previas a la vista, el carrusel se mueve entero un
  // hueco (960 px, el ancho de .page): la página actual sale hacia el lado
  // contrario y se difumina, la vista previa del destino viaja al centro,
  // pierde el blur y pasa a tamaño real, y la del otro lado sale de la
  // pantalla. Solo se animan transform y filter. La página nueva aparece ya
  // centrada (data-enter="…-carousel" sin animación de entrada).
  var CAROUSEL_SHIFT = 960;

  function carouselReady() {
    return !!(wide && wide.matches && root.hasAttribute('data-previews') &&
      document.querySelectorAll('.page-preview-page').length === 2);
  }

  function moveCarousel(dir, done) {
    var pages = document.querySelectorAll('.page-preview-page');
    // El marco va pegado al borde de la pantalla, separado de la página
    // actual (960 px, centrada) por un hueco: el desplazamiento lo incluye
    // para que la miniatura acabe justo donde está la página. Con decimales,
    // para no dejar un salto de 1 px.
    var gap = 0;
    for (var g = 0; g < pages.length; g++) {
      var frame = pages[g].parentNode;
      if (frame.parentNode.getAttribute('data-side') === 'next') {
        gap = frame.getBoundingClientRect().left - (root.clientWidth + CAROUSEL_SHIFT) / 2;
      }
    }
    var shift = dir === 'next' ? -(CAROUSEL_SHIFT + gap) : CAROUSEL_SHIFT + gap;
    var incoming = null;
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      var side = page.parentNode.parentNode.getAttribute('data-side');
      var scale = previewScale(page.parentNode);
      page.style.transition = 'transform 0.5s ease-in-out, filter 0.5s ease-in-out';
      if (side === dir) {
        incoming = page;
        page.style.transform = 'translateX(' + shift + 'px) scale(1)';
        page.style.filter = 'blur(0)';
      } else {
        page.style.transform = 'translateX(' + shift + 'px) scale(' + scale + ')';
      }
    }
    if (incoming) {
      incoming.addEventListener('transitionend', function (event) {
        if (event.propertyName === 'transform') done();
      });
    }
  }

  // Al volver con «Atrás» desde la caché del navegador: todo a su sitio.
  function resetCarousel() {
    var pages = document.querySelectorAll('.page-preview-page');
    for (var i = 0; i < pages.length; i++) {
      pages[i].style.transition = 'none';
      pages[i].style.filter = '';
    }
    scalePreviews();
    for (i = 0; i < pages.length; i++) pages[i].style.transition = '';
  }

  function slideTo(url, dir) {
    if (!url) return;
    if ((reduceMotion && reduceMotion.matches) || root.hasAttribute('data-slide')) {
      if (!root.hasAttribute('data-slide')) window.location.href = url;
      return;
    }
    var carousel = carouselReady();
    var state = carousel ? dir + '-carousel' : dir;
    try {
      window.sessionStorage.setItem('slide-enter', state);
    } catch (error) { /* sin almacenamiento: la página nueva entra como siempre */ }
    var page = document.querySelector('main');
    var left = false;
    var leave = function () {
      if (left) return;
      left = true;
      window.location.href = url;
    };
    root.setAttribute('data-slide', state);
    if (carousel) {
      moveCarousel(dir, leave);
      window.setTimeout(leave, 700); // por si no llega transitionend
    } else {
      if (page) page.addEventListener('animationend', leave);
      window.setTimeout(leave, 400); // por si la animación no llega a lanzarse
    }
  }

  // Al volver con «Atrás», el navegador puede restaurar la página tal como
  // se quedó (bfcache): se quita el estado de salida para que se vea.
  window.addEventListener('pageshow', function () {
    var wasSliding = root.hasAttribute('data-slide');
    root.removeAttribute('data-slide');
    if (wasSliding) resetCarousel();
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

  // ── Deslizar con el dedo en móvil (EV-01) ──────────────────────────────
  // Hasta 768 px, un deslizamiento horizontal claro cambia de página: hacia
  // la izquierda, la siguiente; hacia la derecha, la anterior. No actúa
  // sobre elementos que usan el gesto (vídeo, audio, campos, controles de
  // rango, zonas con desplazamiento horizontal), ni si empieza en los 20 px
  // del borde, donde el sistema tiene su gesto «atrás», ni si hay texto
  // seleccionado. Los enlaces ‹ › siguen siendo la alternativa de un toque.
  var narrow = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
  var SWIPE_MIN = 60;    // px en horizontal
  var SWIPE_RATIO = 1.5; // el horizontal debe superar 1,5 veces al vertical
  var SWIPE_TIME = 800;  // ms como máximo
  var EDGE = 20;         // px de cada borde que se reservan al sistema
  var touch = null;

  function scrollsSideways(el) {
    for (; el && el !== document.body; el = el.parentElement) {
      if (el.scrollWidth > el.clientWidth + 1) {
        var overflow = window.getComputedStyle(el).overflowX;
        if (overflow === 'auto' || overflow === 'scroll') return true;
      }
    }
    return false;
  }

  if (narrow && prevLink && nextLink) {
    document.addEventListener('touchstart', function (event) {
      touch = null;
      if (!narrow.matches || event.touches.length !== 1) return;
      var t = event.touches[0];
      var target = event.target;
      if (t.clientX < EDGE || t.clientX > window.innerWidth - EDGE) return;
      if (target.closest && target.closest(OWN_ARROWS + ', input[type="range"]')) return;
      if (scrollsSideways(target)) return;
      touch = { x: t.clientX, y: t.clientY, time: Date.now() };
    }, { passive: true });

    document.addEventListener('touchend', function (event) {
      if (!touch || event.changedTouches.length !== 1) return;
      var t = event.changedTouches[0];
      var dx = t.clientX - touch.x;
      var dy = t.clientY - touch.y;
      var quick = Date.now() - touch.time <= SWIPE_TIME;
      touch = null;
      if (!quick || Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < SWIPE_RATIO * Math.abs(dy)) return;
      if (window.getSelection && String(window.getSelection())) return;
      rememberSwipe();
      if (dx < 0) slideTo(nextLink.href, 'next');
      else slideTo(prevLink.href, 'prev');
    }, { passive: true });

    document.addEventListener('touchcancel', function () { touch = null; }, { passive: true });

    // PU-03: la pista fija junto al carrusel solo tiene sentido si el gesto
    // existe (con JavaScript); el CSS la muestra hasta 768 px.
    var swipeHint = document.getElementById('carousel-swipe');
    if (swipeHint) swipeHint.hidden = false;
  }

  // ── Aviso del gesto de deslizar (PU-03) ──────────────────────────────
  // En la prueba de usabilidad nadie descubrió el gesto hasta hacerlo sin
  // querer. En pantallas táctiles de hasta 768 px, las dos primeras páginas
  // que se visitan muestran un aviso abajo; desaparece al cerrarlo, a los
  // 10 s o al deslizar, y después de deslizar una vez ya no vuelve.
  var SWIPE_HINT_KEY = 'swipe-hint';
  var SWIPE_HINT_VIEWS = 2;
  var SWIPE_HINT_TIME = 10000;
  var swipeToast = null;

  var SWIPE_TEXT = document.documentElement.lang === 'en' ? {
    hint: 'Swipe left or right to change page',
    close: 'Close tip'
  } : {
    hint: 'Desliza el dedo a los lados para cambiar de página',
    close: 'Cerrar aviso'
  };

  var HAND_ICON = '<svg aria-hidden="true" focusable="false" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>';

  function hideSwipeToast() {
    if (swipeToast && swipeToast.parentNode) swipeToast.parentNode.removeChild(swipeToast);
    swipeToast = null;
  }

  function rememberSwipe() {
    try {
      window.localStorage.setItem(SWIPE_HINT_KEY, 'done');
    } catch (error) { /* sin almacenamiento: el aviso no se recuerda */ }
    hideSwipeToast();
  }

  function showSwipeToast() {
    var touchScreen = window.matchMedia('(hover: none) and (pointer: coarse)');
    if (!narrow.matches || !touchScreen.matches) return;
    var seen;
    try {
      seen = window.localStorage.getItem(SWIPE_HINT_KEY);
      if (seen === 'done' || Number(seen) >= SWIPE_HINT_VIEWS) return;
      window.localStorage.setItem(SWIPE_HINT_KEY, String(Number(seen || 0) + 1));
    } catch (error) {
      return; // sin almacenamiento saldría en cada página: mejor no mostrarlo
    }

    swipeToast = document.createElement('div');
    swipeToast.className = 'swipe-toast';
    swipeToast.setAttribute('role', 'status');
    var text = document.createElement('p');
    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', SWIPE_TEXT.close);
    close.textContent = '×';
    close.addEventListener('click', rememberSwipe);
    swipeToast.innerHTML = HAND_ICON;
    swipeToast.appendChild(text);
    swipeToast.appendChild(close);
    document.body.appendChild(swipeToast);
    // El texto llega después de crear la región role=status, para que el
    // lector de pantalla lo anuncie.
    window.requestAnimationFrame(function () { text.textContent = SWIPE_TEXT.hint; });
    window.setTimeout(hideSwipeToast, SWIPE_HINT_TIME);
  }

  if (narrow && prevLink && nextLink) showSwipeToast();

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
  var PREVIEW_WIDTH = 960; // ancho real de .page
  // EV-02: la franja enseña solo la octava parte de la página vecina, la que
  // queda junto a la actual (como las diapositivas que asoman en un carrusel).
  var PREVIEW_VISIBLE = PREVIEW_WIDTH / 8;
  var previewsRequested = false;

  // «Conocimientos y Proyectos · Francisco Cimadevilla» → «Conocimientos y Proyectos»
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
    // Fase 2 (AAA): la miniatura es decorativa, pero TAW y otros validadores
    // no tienen en cuenta aria-hidden ni inert y contaban como fallos los
    // controles del formulario de Inicio, sus etiquetas y los encabezados del
    // clon. Se quedan solo el texto y las cajas: controles → cajas grises,
    // botones y salidas → <span> con su texto, y el resto de elementos con
    // función (formulario, etiquetas, nav, details, encabezados) → bloques
    // sin semántica.
    var controls = page.querySelectorAll('input, textarea, select, button, output');
    for (i = 0; i < controls.length; i++) {
      var control = controls[i];
      if (control.type === 'hidden') {
        control.parentNode.removeChild(control);
      } else if (control.tagName === 'BUTTON' || control.tagName === 'OUTPUT') {
        retag(control, 'span');
      } else {
        var field = doc.createElement('span');
        field.className = 'page-preview-media';
        field.style.height = control.tagName === 'TEXTAREA' ? '7rem' : control.type === 'checkbox' ? '1rem' : '2.75rem';
        if (control.type === 'checkbox') field.style.width = '1rem';
        replaceWith(control, field);
      }
    }
    var plain = page.querySelectorAll('form, label, nav, details, summary, h1, h2, h3, h4, h5, h6');
    for (i = 0; i < plain.length; i++) {
      var heading = /^H\d$/.test(plain[i].tagName);
      var block = retag(plain[i], plain[i].tagName === 'LABEL' ? 'span' : 'div');
      if (heading) block.className = 'page-preview-heading';
    }
    var all = page.querySelectorAll('*');
    for (i = 0; i < all.length; i++) {
      var attrs = all[i].attributes;
      for (var a = attrs.length - 1; a >= 0; a--) {
        var name = attrs[a].name;
        if (name === 'id' || name === 'for' || name === 'role' || name === 'tabindex' || name.indexOf('aria-') === 0) {
          all[i].removeAttribute(name);
        }
      }
    }
  }

  // Cambia la etiqueta de un elemento conservando su clase y su contenido.
  function retag(el, tag) {
    var node = el.ownerDocument.createElement(tag);
    if (el.className) node.className = el.className;
    while (el.firstChild) node.appendChild(el.firstChild);
    replaceWith(el, node);
    return node;
  }

  // Escala = ancho del marco / 120 px: así cabe justo un octavo de la
  // página. El marco mide la mitad del hueco que deja el margen, y como
  // mucho 120 px, de modo que la escala no pasa de 1. El CSS pega el marco
  // al borde de la pantalla y, dentro, ancla la miniatura por el lado que
  // queda junto a la página actual (data-side).
  function previewScale(frame) {
    return frame.clientWidth / PREVIEW_VISIBLE;
  }

  function scalePreviews() {
    var frames = document.querySelectorAll('.page-preview-frame');
    for (var i = 0; i < frames.length; i++) {
      var scale = previewScale(frames[i]);
      if (scale > 0 && !root.hasAttribute('data-slide')) {
        frames[i].firstChild.style.transform = 'scale(' + scale + ')';
      }
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
        preview.setAttribute('data-side', isPrev ? 'prev' : 'next');
        var title = document.createElement('span');
        title.className = 'page-preview-title';
        title.textContent = isPrev ? '‹ ' + name : name + ' ›';
        var frame = document.createElement('span');
        frame.className = 'page-preview-frame';
        frame.appendChild(page);
        preview.appendChild(title);
        preview.appendChild(frame);

        // Junto al enlace y no dentro: así el texto del enlace es solo su flecha
        // y su aria-label, y no todo el texto de la página vecina (TAW, 2.4.4).
        // La miniatura no recibe el puntero; el enlace, transparente y encima,
        // ocupa el mismo sitio. Al pasar el ratón la miniatura se enfoca un poco.
        link.parentNode.insertBefore(preview, link.nextSibling);
        link.addEventListener('mouseenter', function () { preview.setAttribute('data-hover', ''); });
        link.addEventListener('mouseleave', function () { preview.removeAttribute('data-hover'); });
        scalePreviews();
      })
      .catch(unprepare);
  }

  // El hueco de las vistas previas (data-previews en <html>) lo reserva el
  // script del <head> antes del primer pintado; aquí solo hace falta si la
  // ventana se ensancha después. La flecha pasa a un <span> que el CSS
  // muestra solo por debajo de 1200 px.
  function prepare(link) {
    root.setAttribute('data-previews', '');
    var arrow = document.createElement('span');
    arrow.className = 'page-lateral-arrow';
    arrow.textContent = link.textContent;
    link.textContent = '';
    link.appendChild(arrow);
  }

  // Si una página vecina no se ha podido leer, vuelven las dos flechas de
  // siempre, para que los dos lados se vean iguales.
  function unprepare() {
    root.removeAttribute('data-previews');
    for (var i = 0; i < lateral.length; i++) {
      var arrow = lateral[i].querySelector('.page-lateral-arrow');
      if (arrow) lateral[i].textContent = arrow.textContent;
    }
  }

  function requestPreviews() {
    if (previewsRequested || !wide.matches) return;
    previewsRequested = true;
    var i;
    for (i = 0; i < lateral.length; i++) prepare(lateral[i]);
    var build = function () {
      for (var j = 0; j < lateral.length; j++) buildPreview(lateral[j], j === 0);
    };
    // Se leen después del evento load, para no competir con la página actual.
    if (document.readyState === 'complete') build();
    else window.addEventListener('load', build);
  }

  // Con file:// el navegador no deja leer otras páginas: ni se intenta.
  if (lateral.length === 2 && wide && window.fetch && window.DOMParser && window.location.protocol !== 'file:') {
    requestPreviews();
    // Si la ventana se ensancha más tarde, se construyen entonces.
    if (wide.addEventListener) wide.addEventListener('change', requestPreviews);
    else if (wide.addListener) wide.addListener(requestPreviews);

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