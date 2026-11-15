/* ==========================================================================
   Eye tracking de auditoría con WebGazer.js (https://webgazer.cs.brown.edu/)

   Flujo: cámara → calibración de 9 puntos → prueba de precisión → sesión.
   Durante la sesión el sitio se carga en un iframe del mismo origen que
   ocupa toda la ventana, así las coordenadas de la mirada (relativas a la
   ventana) coinciden con las del iframe y se pueden pasar a coordenadas de
   documento sumando su scroll. Cada sesión produce dos archivos, que
   servidor.py guarda en tests/usabilidad/eyetracking/ (si no está, se descargan):
     · .json con todas las muestras (para el mapa de calor y el recorrido)
     · .mp4/.webm con la pestaña grabada y el punto de mirada incrustado
       (el participante no ve el punto; solo aparece en el vídeo).
   El análisis está en analisis.html.
   ========================================================================== */

(function () {
  'use strict';

  var WEBGAZER_VERSION = '3.5.3';
  var CLICS_POR_PUNTO = 5;
  var MEDICION_MS = 5000;
  var SITE_BASE = new URL('../../', location.href).pathname;

  var $ = function (sel) { return document.querySelector(sel); };

  var estado = {
    opciones: null,
    iniciado: false,
    calibrado: false,
    fase: 'inicio',          // inicio | calibracion | precision | sesion | fin
    precision: null,
    medicion: [],
    sesion: null,
    ultimaMirada: null,
    estela: [],
  };

  // ── Navegación entre pasos ────────────────────────────────────────────
  function mostrar(id) {
    document.querySelectorAll('[data-step]').forEach(function (s) { s.hidden = s.id !== id; });
  }

  // ── WebGazer ──────────────────────────────────────────────────────────
  async function arrancarWebGazer() {
    if (typeof webgazer === 'undefined') {
      alert('No se encuentra WebGazer. Ejecuta antes: bash tests/eyetracking/instalar-webgazer.sh');
      return false;
    }
    if (estado.iniciado) {
      webgazer.applyKalmanFilter(estado.opciones.kalman);
      await webgazer.resume();
      return true;
    }
    webgazer.params.faceMeshSolutionPath = window.WEBGAZER_CDN
      ? window.WEBGAZER_CDN + 'mediapipe/face_mesh'
      : './vendor/webgazer/mediapipe/face_mesh';
    webgazer.saveDataAcrossSessions(false);
    try { await webgazer.clearData(); } catch (e) { /* nada guardado aún */ }
    webgazer
      .setRegression('ridge')
      .applyKalmanFilter(estado.opciones.kalman)
      .setGazeListener(alMirar);
    try {
      await webgazer.begin();
    } catch (err) {
      alert('No se pudo acceder a la cámara: ' + err.message);
      return false;
    }
    webgazer.showVideoPreview(true).showPredictionPoints(false);
    estado.iniciado = true;
    return true;
  }

  function alMirar(data) {
    if (!data) return;
    var ahora = performance.now();
    if (estado.fase === 'precision' && estado.medicion) {
      estado.medicion.push({ x: data.x, y: data.y });
    }
    if (estado.fase !== 'sesion' || !estado.sesion) return;

    var s = estado.sesion;
    var muestra = { t: Math.round(ahora - s.t0), x: Math.round(data.x), y: Math.round(data.y), sx: 0, sy: 0, p: s.paginaActual };
    try {
      var w = $('#sitio').contentWindow;
      muestra.sx = Math.round(w.scrollX);
      muestra.sy = Math.round(w.scrollY);
    } catch (e) { /* página fuera del sitio: se guarda sin scroll */ }
    s.muestras.push(muestra);
    registrarZona(s, data, muestra);

    estado.ultimaMirada = { x: data.x, y: data.y };
    estado.estela.push({ x: data.x, y: data.y, t: ahora });
    while (estado.estela.length && ahora - estado.estela[0].t > 600) estado.estela.shift();
  }

  // ── Calibración ───────────────────────────────────────────────────────
  var POSICIONES = [
    [10, 10], [50, 10], [90, 10],
    [10, 50], [50, 50], [90, 50],
    [10, 90], [50, 90], [90, 90],
  ];

  function prepararCalibracion() {
    estado.fase = 'calibracion';
    estado.calibrado = false;
    mostrar('paso-calibracion');
    webgazer.showVideoPreview(true);
    webgazer.showPredictionPoints(false);
    $('#calib-instrucciones').hidden = false;
    $('#calib-puntos').hidden = true;
    $('#precision').hidden = true;
    $('#punto-precision').hidden = true;
  }

  function empezarCalibracion() {
    // La vista de la cámara taparía el punto de arriba a la izquierda.
    webgazer.showVideoPreview(false);
    webgazer.addMouseEventListeners();
    $('#calib-instrucciones').hidden = true;
    var cont = $('#calib-puntos');
    cont.innerHTML = '';
    cont.hidden = false;
    POSICIONES.forEach(function (pos, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'punto-calib';
      b.style.left = pos[0] + '%';
      b.style.top = pos[1] + '%';
      b.dataset.clics = '0';
      b.setAttribute('aria-label', 'Punto de calibración ' + (i + 1));
      cont.appendChild(b);
    });
  }

  function clicEnPunto(e) {
    var b = e.target.closest('.punto-calib');
    if (!b || b.classList.contains('hecho')) return;
    var n = Number(b.dataset.clics) + 1;
    b.dataset.clics = String(n);
    if (n >= CLICS_POR_PUNTO) {
      b.classList.add('hecho');
      b.disabled = true;
    }
    if (document.querySelectorAll('.punto-calib:not(.hecho)').length === 0) {
      setTimeout(medirPrecision, 300);
    }
  }

  // Como en la demo oficial: mirar el centro 5 s y comparar con lo predicho.
  function medirPrecision() {
    mostrar('paso-calibracion');
    $('#calib-instrucciones').hidden = true;
    $('#calib-puntos').hidden = true;
    $('#precision').hidden = false;
    $('#precision-botones').hidden = true;
    $('#precision-texto').textContent = 'Mira fijamente el punto azul del centro durante 5 segundos sin mover el ratón.';
    $('#punto-precision').hidden = false;
    // Lo que haga el ratón ahora no debe entrenar el modelo.
    webgazer.removeMouseEventListeners();

    setTimeout(function () {
      estado.medicion = [];
      estado.fase = 'precision';
      setTimeout(function () {
        estado.fase = 'calibracion';
        var r = calcularPrecision(estado.medicion);
        estado.precision = r;
        estado.calibrado = true;
        $('#punto-precision').hidden = true;
        $('#precision-texto').innerHTML = r
          ? 'Precisión: <strong>' + r.pct + ' %</strong> · error medio ≈ ' + r.errorPx + ' px.' +
            (r.pct < 70 ? ' Es baja: conviene recalibrar.' : '')
          : 'No se ha recibido ninguna predicción. Revisa la luz y que la cara se vea en la cámara.';
        $('#precision-botones').hidden = false;
        $('#iniciar-sesion').disabled = !r;
      }, MEDICION_MS);
    }, 1000);
  }

  function calcularPrecision(puntos) {
    if (!puntos.length) return null;
    var cx = innerWidth / 2;
    var cy = innerHeight / 2;
    var mitad = innerHeight / 2;
    var sumaPct = 0;
    var sumaDist = 0;
    puntos.forEach(function (p) {
      var d = Math.hypot(p.x - cx, p.y - cy);
      sumaDist += d;
      sumaPct += Math.max(0, 100 - (d / mitad) * 100);
    });
    return { pct: Math.round(sumaPct / puntos.length), errorPx: Math.round(sumaDist / puntos.length), muestras: puntos.length };
  }

  // ── Sesión ────────────────────────────────────────────────────────────
  function clavePagina(win) {
    try {
      var path = decodeURIComponent(win.location.pathname);
      if (path.indexOf(SITE_BASE) === 0) path = path.slice(SITE_BASE.length);
      if (path === '' || path.slice(-1) === '/') path += 'index.html';
      return path;
    } catch (e) {
      return '(externa)';
    }
  }

  async function iniciarSesion() {
    var op = estado.opciones;
    var stream = null;
    if (op.video) {
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 30, displaySurface: 'browser' },
          audio: false,
          preferCurrentTab: true,
          selfBrowserSurface: 'include',
          surfaceSwitching: 'exclude',
        });
      } catch (err) {
        if (!confirm('No se ha podido grabar la pantalla (' + err.message + '). ¿Seguir solo con los datos de mirada?')) return;
      }
    }

    webgazer.showVideoPreview(false).showPredictionPoints(false);
    mostrar('paso-sesion');

    var s = {
      t0: performance.now(),
      inicio: new Date(),
      muestras: [],
      navegacion: [],
      paginaActual: clavePagina({ location: new URL(op.pagina, location.href) }),
      stream: stream,
      recorder: null,
      trozos: [],
      terminada: false,
      zonas: {},         // página -> zona -> ms mirados (toda la sesión)
      eventos: [],       // eventos de mirada enviados a Hotjar
      vista: null,       // contadores de la página vista actual
      ultimaT: null,
    };
    estado.sesion = s;
    // Marca común a los dos registros: va en el nombre de los archivos, en la URL
    // inicial (?et=…) y como evento de página de Hotjar/Contentsquare.
    s.marca = nombreBase(s);

    var lienzo = $('#capa-mirada');
    lienzo.width = innerWidth;
    lienzo.height = innerHeight;

    if (stream) prepararGrabacion(s);

    var iframe = $('#sitio');
    iframe.onload = function () {
      s.paginaActual = clavePagina(iframe.contentWindow);
      s.navegacion.push({ t: Math.round(performance.now() - s.t0), p: s.paginaActual });
      // Cada página vista empieza de cero: Hotjar admite 40 eventos por página vista.
      s.vista = { ms: {}, enviados: {}, n: 0 };
      try {
        var w = iframe.contentWindow;
        w.addEventListener('keydown', function (e) { if (e.key === 'Escape') terminarSesion(); });
        marcarEnHotjar(w, s);
      } catch (e) { /* externa */ }
    };
    iframe.src = op.pagina + '?et=' + encodeURIComponent(s.marca);
    estado.fase = 'sesion';
    requestAnimationFrame(pintarCapa);
  }

  // ── Hotjar / Contentsquare ────────────────────────────────────────────
  // Las páginas del sitio llevan la etiqueta de Contentsquare (Hotjar). Dentro
  // del iframe graban su propia sesión, y aquí se le añade lo que solo sabe
  // WebGazer:
  //   · variables dinámicas de la sesión (participante, tarea, precisión), para
  //     segmentar: «solo sesiones de eye tracking», «precisión > 70»…
  //   · un evento "mirada:<zona>" cuando una zona acumula 1 s de mirada en la
  //     página vista, para filtrar grabaciones: «miró el CV y no hizo clic».
  var UMBRAL_ZONA_MS = 1000;
  var MAX_EVENTOS_ZONA = 30; // de 40 por página vista; el resto queda libre para el sitio

  function uxa(w) {
    w._uxa = w._uxa || [];
    return w._uxa;
  }

  function marcarEnHotjar(w, s) {
    var q = uxa(w);
    q.push(['trackPageEvent', 'eyetracking:' + s.marca]);
    q.push(['trackDynamicVariable', { key: 'et_marca', value: s.marca }]);
    q.push(['trackDynamicVariable', { key: 'et_participante', value: estado.opciones.participante.slice(0, 255) }]);
    q.push(['trackDynamicVariable', { key: 'et_tarea', value: estado.opciones.tarea.slice(0, 255) }]);
    if (estado.precision) q.push(['trackDynamicVariable', { key: 'et_precision', value: estado.precision.pct }]);
    if (typeof w.hj === 'function') w.hj('event', 'eyetracking');
  }

  function registrarZona(s, data, m) {
    var dt = s.ultimaT == null ? 0 : Math.min(200, Math.max(0, m.t - s.ultimaT));
    s.ultimaT = m.t;
    if (!s.vista || data.x < 0 || data.y < 0 || data.x > innerWidth || data.y > innerHeight) return;
    var doc;
    try { doc = $('#sitio').contentDocument; } catch (e) { return; }
    if (!doc) return;
    var zona = nombreZona(doc.elementFromPoint(data.x, data.y));
    if (!zona) return;

    var pz = s.zonas[s.paginaActual] || (s.zonas[s.paginaActual] = {});
    pz[zona] = (pz[zona] || 0) + dt;

    var v = s.vista;
    v.ms[zona] = (v.ms[zona] || 0) + dt;
    if (v.ms[zona] >= UMBRAL_ZONA_MS && !v.enviados[zona] && v.n < MAX_EVENTOS_ZONA) {
      v.enviados[zona] = true;
      v.n++;
      var nombre = ('mirada:' + zona).slice(0, 255);
      try {
        var w = $('#sitio').contentWindow;
        uxa(w).push(['trackPageEvent', nombre]);
        if (typeof w.hj === 'function') w.hj('event', nombre.replace(/[^\w-]+/g, '_').slice(0, 250));
      } catch (e) { /* externa */ }
      s.eventos.push({ t: m.t, p: s.paginaActual, e: nombre });
    }
  }

  // Zona de interés del elemento mirado: la más interior que tenga nombre.
  // data-aoi="…" en el HTML permite nombrar a mano cualquier elemento.
  function nombreZona(el) {
    for (; el && el.nodeType === 1; el = el.parentElement) {
      var tag = el.tagName.toLowerCase();
      if (el.dataset && el.dataset.aoi) return el.dataset.aoi;
      if (tag === 'a' || tag === 'button') return 'enlace:' + texto(el);
      if (tag === 'article' || tag === 'figure') {
        var t = el.querySelector('h2, h3, h4, figcaption, img[alt]');
        return 'tarjeta:' + (t ? (t.alt || texto(t)) : tag);
      }
      if (tag === 'section') {
        var id = el.getAttribute('aria-labelledby');
        var h = (id && el.ownerDocument.getElementById(id)) || el.querySelector('h1, h2');
        return 'seccion:' + (h ? texto(h) : 'sin título');
      }
      if (tag === 'h1') return 'titulo';
      if (tag === 'nav') return 'nav:' + (el.getAttribute('aria-label') || 'navegación');
      if (tag === 'header') return 'cabecera';
      if (tag === 'footer') return 'pie';
      if (tag === 'main') return 'contenido';
    }
    return null;
  }

  function texto(el) {
    return (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) || el.tagName.toLowerCase();
  }

  // El vídeo se compone en un canvas: fotograma de la pestaña + punto de mirada.
  function prepararGrabacion(s) {
    var video = document.createElement('video');
    video.muted = true;
    video.srcObject = s.stream;
    video.play();
    var comp = document.createElement('canvas');
    var ctx = comp.getContext('2d');
    s.video = video;
    s.comp = comp;

    s.stream.getVideoTracks()[0].addEventListener('ended', terminarSesion);

    // avc3 admite cambios de resolución a mitad de grabación (p. ej. pulsar F11); avc1 no.
    var tipos = ['video/mp4;codecs=avc3', 'video/mp4;codecs=avc1', 'video/webm;codecs=vp9', 'video/webm'];
    var tipo = tipos.find(function (t) { return window.MediaRecorder && MediaRecorder.isTypeSupported(t); }) || '';

    function dibujar() {
      if (s.terminada) return;
      if (video.videoWidth) {
        if (comp.width !== video.videoWidth) { comp.width = video.videoWidth; comp.height = video.videoHeight; }
        ctx.drawImage(video, 0, 0);
        // La pestaña capturada mide lo mismo que la ventana: se escala a píxeles del vídeo.
        pintarMirada(ctx, comp.width / innerWidth, comp.height / innerHeight);
      }
      if (s.recorder && s.recorder.state === 'inactive' && comp.width) {
        s.recorder.start(1000);
        s.t0Video = performance.now() - s.t0;
      }
      requestAnimationFrame(dibujar);
    }

    s.recorder = new MediaRecorder(comp.captureStream(30), tipo ? { mimeType: tipo, videoBitsPerSecond: 6e6 } : undefined);
    s.tipoVideo = s.recorder.mimeType || tipo || 'video/webm';
    s.recorder.ondataavailable = function (e) { if (e.data.size) s.trozos.push(e.data); };
    requestAnimationFrame(dibujar);
  }

  function pintarMirada(ctx, ex, ey) {
    var estela = estado.estela;
    if (!estela.length) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(230, 40, 40, 0.35)';
    ctx.lineWidth = 6 * ex;
    ctx.beginPath();
    estela.forEach(function (p, i) {
      if (i === 0) ctx.moveTo(p.x * ex, p.y * ey); else ctx.lineTo(p.x * ex, p.y * ey);
    });
    ctx.stroke();
    var u = estela[estela.length - 1];
    ctx.fillStyle = 'rgba(230, 40, 40, 0.45)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2 * ex;
    ctx.beginPath();
    ctx.arc(u.x * ex, u.y * ey, 18 * ex, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function pintarCapa() {
    if (estado.fase !== 'sesion') return;
    var lienzo = $('#capa-mirada');
    var ctx = lienzo.getContext('2d');
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    if (estado.opciones.verPunto) pintarMirada(ctx, 1, 1);
    requestAnimationFrame(pintarCapa);
  }

  function terminarSesion() {
    var s = estado.sesion;
    if (!s || s.terminada) return;
    s.terminada = true;
    estado.fase = 'fin';
    var duracion = Math.round(performance.now() - s.t0);
    webgazer.pause();

    var base = s.marca;
    var datos = {
      marca: s.marca,
      sitio: new URL('../../', location.href).href,
      formato: 'webpersonal-eyetracking/1',
      herramienta: 'WebGazer.js ' + WEBGAZER_VERSION,
      participante: estado.opciones.participante,
      tarea: estado.opciones.tarea,
      inicio: s.inicio.toISOString(),
      duracionMs: duracion,
      inicioVideoMs: s.t0Video == null ? null : Math.round(s.t0Video),
      viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio },
      precision: estado.precision,
      opciones: { kalman: estado.opciones.kalman, puntoVisible: estado.opciones.verPunto, regresion: 'ridge' },
      navegador: navigator.userAgent,
      navegacion: s.navegacion,
      zonas: s.zonas,
      hotjar: { umbralZonaMs: UMBRAL_ZONA_MS, eventos: s.eventos },
      muestras: s.muestras,
    };
    estado.ultimaMarca = s.marca;
    // Copia para la página de análisis, por si no hay servidor que la guarde.
    try { sessionStorage.setItem('et-ultima', JSON.stringify(datos)); } catch (e) { /* demasiado grande */ }

    $('#resumen').textContent = 'Guardando…';
    $('#guardado').textContent = '';
    mostrar('paso-fin');
    if (s.stream) s.stream.getTracks().forEach(function (t) { t.stop(); });
    $('#sitio').onload = null;
    $('#sitio').src = 'about:blank';

    var video = new Promise(function (resolver) {
      if (!s.recorder || s.recorder.state === 'inactive') return resolver(null);
      s.recorder.onstop = function () { resolver(new Blob(s.trozos, { type: s.tipoVideo })); };
      s.recorder.stop();
    });

    var json = new Blob([JSON.stringify(datos)], { type: 'application/json' });
    Promise.all([guardar(json, base + '.json'), video.then(function (blob) {
      if (!blob) return null;
      var ext = s.tipoVideo.indexOf('mp4') !== -1 ? '.mp4' : '.webm';
      return guardar(blob, base + ext);
    })]).then(function (r) {
      var seg = (duracion / 1000).toFixed(0);
      $('#resumen').textContent = datos.participante + ' · ' + datos.tarea + ': ' + seg + ' s, ' +
        s.muestras.length + ' muestras (' + Math.round(s.muestras.length / Math.max(1, duracion / 1000)) + ' por segundo), ' +
        s.navegacion.length + ' páginas vistas' + (r[1] ? ', con vídeo.' : ', sin vídeo.');
      var enServidor = r.filter(Boolean).every(function (x) { return x.servidor; });
      $('#guardado').textContent = enServidor
        ? 'Guardado en tests/usabilidad/eyetracking/: ' + r.filter(Boolean).map(function (x) { return x.nombre; }).join(', ') + '.'
        : 'No hay servidor de pruebas (tests/eyetracking/servidor.py): los archivos se han descargado. Muévelos a tests/usabilidad/eyetracking/.';
    });
  }

  // Guarda en el servidor de la prueba; si no lo hay (p. ej. python -m http.server), lo descarga.
  function guardar(blob, nombre) {
    return fetch('/api/eyetracking/sesiones/' + encodeURIComponent(nombre), { method: 'POST', body: blob })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        return { nombre: nombre, servidor: true };
      })
      .catch(function () {
        descargar(blob, nombre);
        return { nombre: nombre, servidor: false };
      });
  }

  function nombreBase(s) {
    var limpiar = function (t) {
      return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    };
    var d = s.inicio;
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var fecha = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes());
    return 'et-' + limpiar(estado.opciones.participante) + '-' + limpiar(estado.opciones.tarea) + '-' + fecha;
  }

  function descargar(blob, nombre) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
  }

  // ── Eventos ───────────────────────────────────────────────────────────
  // El script de PowerShell abre la herramienta con ?participante=…&tarea=…&pagina=…
  (function rellenarDesdeUrl() {
    var q = new URLSearchParams(location.search);
    var f = $('#form-sesion');
    if (q.get('participante')) f.participante.value = q.get('participante');
    if (q.get('tarea')) f.tarea.value = q.get('tarea');
    var pag = q.get('pagina');
    if (pag && f.pagina.querySelector('option[value="../../' + pag + '"]')) f.pagina.value = '../../' + pag;
  })();

  $('#form-sesion').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target;
    estado.opciones = {
      participante: f.participante.value.trim(),
      tarea: f.tarea.value.trim(),
      pagina: f.pagina.value,
      video: f.video.checked,
      verPunto: f.verPunto.checked,
      kalman: f.kalman.checked,
    };
    var boton = f.querySelector('button[type=submit]');
    boton.disabled = true;
    boton.textContent = 'Cargando el modelo…';
    var ok = await arrancarWebGazer();
    boton.disabled = false;
    boton.textContent = 'Activar la cámara';
    if (!ok) return;
    // Otra tarea con la misma calibración: solo se vuelve a validar la precisión.
    if (estado.calibrado) medirPrecision(); else prepararCalibracion();
  });

  $('#calib-empezar').addEventListener('click', empezarCalibracion);
  $('#calib-puntos').addEventListener('click', clicEnPunto);
  $('#recalibrar').addEventListener('click', async function () { await webgazer.clearData(); prepararCalibracion(); });
  $('#iniciar-sesion').addEventListener('click', iniciarSesion);
  $('#terminar').addEventListener('click', terminarSesion);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && estado.fase === 'sesion') terminarSesion(); });

  $('#otra-tarea').addEventListener('click', function () {
    estado.fase = 'inicio';
    $('#form-sesion').tarea.value = '';
    mostrar('paso-inicio');
    $('#form-sesion').tarea.focus();
  });
  $('#recalibrar-fin').addEventListener('click', async function () {
    await webgazer.resume();
    await webgazer.clearData();
    prepararCalibracion();
  });
  // El análisis se abre en otra pestaña para no perder la calibración.
  $('#analizar-ahora').addEventListener('click', function () {
    window.open('analisis.html#s=' + encodeURIComponent(estado.ultimaMarca || ''), '_blank');
  });
})();
