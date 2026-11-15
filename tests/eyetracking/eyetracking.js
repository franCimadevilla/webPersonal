/* ==========================================================================
   Eye tracking de auditoría con WebGazer.js (https://webgazer.cs.brown.edu/)

   Flujo: cámara → calibración de 9 puntos → prueba de precisión → sesión.
   Durante la sesión el sitio se carga en un iframe del mismo origen que
   ocupa toda la ventana, así las coordenadas de la mirada (relativas a la
   ventana) coinciden con las del iframe y se pueden pasar a coordenadas de
   documento sumando su scroll. Se descargan dos archivos por sesión:
     · .json con todas las muestras (para el mapa de calor y el recorrido)
     · .mp4/.webm con la pestaña grabada y el punto de mirada incrustado
       (el participante no ve el punto; solo aparece en el vídeo).
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
    fase: 'inicio',          // inicio | calibracion | precision | sesion | fin | analisis
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
    webgazer.params.faceMeshSolutionPath = './vendor/webgazer/mediapipe/face_mesh';
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
    };
    estado.sesion = s;

    var lienzo = $('#capa-mirada');
    lienzo.width = innerWidth;
    lienzo.height = innerHeight;

    if (stream) prepararGrabacion(s);

    var iframe = $('#sitio');
    iframe.onload = function () {
      s.paginaActual = clavePagina(iframe.contentWindow);
      s.navegacion.push({ t: Math.round(performance.now() - s.t0), p: s.paginaActual });
      try {
        iframe.contentWindow.addEventListener('keydown', function (e) { if (e.key === 'Escape') terminarSesion(); });
      } catch (e) { /* externa */ }
    };
    iframe.src = op.pagina;
    estado.fase = 'sesion';
    requestAnimationFrame(pintarCapa);
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

    var tipos = ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9', 'video/webm'];
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

    var base = nombreBase(s);
    var datos = {
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
      muestras: s.muestras,
    };
    descargar(new Blob([JSON.stringify(datos)], { type: 'application/json' }), base + '.json');
    estado.ultimosDatos = datos;

    var fin = function () {
      if (s.stream) s.stream.getTracks().forEach(function (t) { t.stop(); });
      $('#sitio').onload = null;
      $('#sitio').src = 'about:blank';
      var seg = (duracion / 1000).toFixed(0);
      $('#resumen').textContent = datos.participante + ' · ' + datos.tarea + ': ' + seg + ' s, ' +
        s.muestras.length + ' muestras (' + Math.round(s.muestras.length / Math.max(1, duracion / 1000)) + ' por segundo), ' +
        s.navegacion.length + ' páginas vistas' + (s.recorder ? ', con vídeo.' : ', sin vídeo.');
      mostrar('paso-fin');
    };

    if (s.recorder && s.recorder.state !== 'inactive') {
      s.recorder.onstop = function () {
        var ext = s.tipoVideo.indexOf('mp4') !== -1 ? '.mp4' : '.webm';
        descargar(new Blob(s.trozos, { type: s.tipoVideo }), base + ext);
        fin();
      };
      s.recorder.stop();
    } else {
      fin();
    }
  }

  function nombreBase(s) {
    var limpiar = function (t) {
      return t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
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

  // ── Análisis ──────────────────────────────────────────────────────────
  var analisis = { sesiones: [] };

  function abrirAnalisis(datos) {
    estado.fase = 'analisis';
    if (estado.iniciado) {
      webgazer.pause();
      webgazer.showVideoPreview(false);
    }
    mostrar('paso-analisis');
    if (datos) cargarSesiones([datos]);
  }

  function leerArchivos(files) {
    Promise.all(Array.prototype.map.call(files, function (f) {
      return f.text().then(JSON.parse).catch(function () { return null; });
    })).then(function (lista) {
      var validas = lista.filter(function (d) { return d && Array.isArray(d.muestras); });
      if (validas.length < lista.length) alert('Algún archivo no era una sesión válida y se ha ignorado.');
      cargarSesiones(validas);
    });
  }

  function cargarSesiones(lista) {
    analisis.sesiones = lista;
    var cuenta = {};
    lista.forEach(function (d) {
      d.muestras.forEach(function (m) { cuenta[m.p] = (cuenta[m.p] || 0) + 1; });
    });
    var sel = $('#filtro-pagina');
    sel.innerHTML = '';
    Object.keys(cuenta).filter(function (p) { return p !== '(externa)'; })
      .sort(function (a, b) { return cuenta[b] - cuenta[a]; })
      .forEach(function (p) {
        var o = document.createElement('option');
        o.value = p;
        o.textContent = p + ' (' + cuenta[p] + ')';
        sel.appendChild(o);
      });
    sel.disabled = !sel.options.length;
    if (sel.options.length) cargarPaginaAnalisis();
  }

  function cargarPaginaAnalisis() {
    var pagina = $('#filtro-pagina').value;
    if (!pagina) return;
    var iframe = $('#sitio-analisis');
    // Mismo ancho que la ventana grabada, para que la maqueta coincida.
    var w = analisis.sesiones[0].viewport.w;
    var distintos = analisis.sesiones.some(function (d) { return d.viewport.w !== w; });
    iframe.style.width = w + 'px';
    iframe.onload = function () {
      pintarAnalisis();
      setTimeout(pintarAnalisis, 800); // imágenes que cambian la altura al cargar
    };
    iframe.src = '../../' + pagina;
    $('#info-analisis').textContent = analisis.sesiones.length + ' sesión(es) · ventana de ' + w + ' px' +
      (distintos ? ' (ojo: hay sesiones grabadas con otro ancho)' : '');
  }

  function puntosDePagina(d, pagina) {
    return d.muestras.filter(function (m) { return m.p === pagina; })
      .map(function (m) { return { t: m.t, x: m.x + m.sx, y: m.y + m.sy }; });
  }

  function pintarAnalisis() {
    var iframe = $('#sitio-analisis');
    var doc;
    try { doc = iframe.contentDocument; } catch (e) { return; }
    if (!doc || !doc.documentElement) return;
    var pagina = $('#filtro-pagina').value;
    var radio = Number($('#filtro-radio').value);
    var vista = $('#filtro-vista').value;

    var ancho = doc.documentElement.scrollWidth;
    var alto = Math.max(doc.documentElement.scrollHeight, doc.body ? doc.body.scrollHeight : 0);
    var lienzo = doc.getElementById('et-capa');
    if (!lienzo) {
      lienzo = doc.createElement('canvas');
      lienzo.id = 'et-capa';
      lienzo.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;z-index:2147483647';
      doc.documentElement.appendChild(lienzo);
    }
    lienzo.width = ancho;
    lienzo.height = alto;
    lienzo.style.width = ancho + 'px';
    lienzo.style.height = alto + 'px';
    var ctx = lienzo.getContext('2d');
    ctx.clearRect(0, 0, ancho, alto);

    if (vista === 'calor') {
      var todos = [];
      analisis.sesiones.forEach(function (d) { todos = todos.concat(puntosDePagina(d, pagina)); });
      mapaDeCalor(ctx, todos, ancho, alto, radio);
    } else {
      var colores = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#008080', '#9a6324', '#000075'];
      analisis.sesiones.forEach(function (d, i) {
        pintarRecorrido(ctx, fijaciones(puntosDePagina(d, pagina), radio * 1.5, 150), colores[i % colores.length]);
      });
    }
  }

  // Acumulación en rejilla a 1/4 de resolución + desenfoque gaussiano.
  function mapaDeCalor(ctx, puntos, ancho, alto, radio) {
    if (!puntos.length) return;
    var K = 4;
    var gw = Math.ceil(ancho / K);
    var gh = Math.ceil(alto / K);
    var rejilla = new Float32Array(gw * gh);
    puntos.forEach(function (p) {
      var gx = Math.floor(p.x / K);
      var gy = Math.floor(p.y / K);
      if (gx >= 0 && gy >= 0 && gx < gw && gy < gh) rejilla[gy * gw + gx] += 1;
    });
    rejilla = desenfocar(rejilla, gw, gh, radio / K / 2);
    var max = 0;
    for (var i = 0; i < rejilla.length; i++) if (rejilla[i] > max) max = rejilla[i];
    if (!max) return;

    var img = new ImageData(gw, gh);
    for (var j = 0; j < rejilla.length; j++) {
      var v = rejilla[j] / max;
      if (v < 0.04) continue;
      var c = paleta(v);
      img.data[j * 4] = c[0];
      img.data[j * 4 + 1] = c[1];
      img.data[j * 4 + 2] = c[2];
      img.data[j * 4 + 3] = Math.round(Math.min(0.75, 0.15 + v) * 255);
    }
    var tmp = document.createElement('canvas');
    tmp.width = gw;
    tmp.height = gh;
    tmp.getContext('2d').putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tmp, 0, 0, gw * K, gh * K);
  }

  function desenfocar(src, w, h, sigma) {
    var r = Math.max(1, Math.ceil(sigma * 3));
    var kernel = [];
    var suma = 0;
    for (var k = -r; k <= r; k++) { var g = Math.exp(-(k * k) / (2 * sigma * sigma)); kernel.push(g); suma += g; }
    kernel = kernel.map(function (g) { return g / suma; });
    var tmp = new Float32Array(w * h);
    var out = new Float32Array(w * h);
    var x, y, k2, acc, xx, yy;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      acc = 0;
      for (k2 = -r; k2 <= r; k2++) { xx = x + k2; if (xx >= 0 && xx < w) acc += src[y * w + xx] * kernel[k2 + r]; }
      tmp[y * w + x] = acc;
    }
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      acc = 0;
      for (k2 = -r; k2 <= r; k2++) { yy = y + k2; if (yy >= 0 && yy < h) acc += tmp[yy * w + x] * kernel[k2 + r]; }
      out[y * w + x] = acc;
    }
    return out;
  }

  // azul → cian → verde → amarillo → rojo
  function paleta(v) {
    var paradas = [[0, [0, 60, 255]], [0.25, [0, 200, 255]], [0.5, [0, 220, 80]], [0.75, [255, 230, 0]], [1, [230, 20, 20]]];
    for (var i = 1; i < paradas.length; i++) {
      if (v <= paradas[i][0]) {
        var a = paradas[i - 1];
        var b = paradas[i];
        var f = (v - a[0]) / (b[0] - a[0]);
        return [0, 1, 2].map(function (c) { return Math.round(a[1][c] + (b[1][c] - a[1][c]) * f); });
      }
    }
    return paradas[paradas.length - 1][1];
  }

  // Detección de fijaciones por dispersión (I-DT).
  function fijaciones(puntos, dispersionMax, duracionMin) {
    var res = [];
    var i = 0;
    while (i < puntos.length) {
      var j = i;
      var minX = puntos[i].x, maxX = minX, minY = puntos[i].y, maxY = minY;
      while (j + 1 < puntos.length) {
        var p = puntos[j + 1];
        var nx0 = Math.min(minX, p.x), nx1 = Math.max(maxX, p.x), ny0 = Math.min(minY, p.y), ny1 = Math.max(maxY, p.y);
        if ((nx1 - nx0) + (ny1 - ny0) > dispersionMax || p.t - puntos[j].t > 300) break;
        minX = nx0; maxX = nx1; minY = ny0; maxY = ny1;
        j++;
      }
      var dur = puntos[j].t - puntos[i].t;
      if (dur >= duracionMin) {
        var sx = 0, sy = 0;
        for (var k = i; k <= j; k++) { sx += puntos[k].x; sy += puntos[k].y; }
        var n = j - i + 1;
        res.push({ x: sx / n, y: sy / n, dur: dur });
        i = j + 1;
      } else {
        i++;
      }
    }
    return res;
  }

  function pintarRecorrido(ctx, fij, color) {
    if (!fij.length) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    ctx.beginPath();
    fij.forEach(function (f, i) { if (i === 0) ctx.moveTo(f.x, f.y); else ctx.lineTo(f.x, f.y); });
    ctx.stroke();
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    fij.forEach(function (f, i) {
      var r = Math.min(45, 8 + Math.sqrt(f.dur) * 0.8);
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.fillText(String(i + 1), f.x, f.y);
    });
    ctx.restore();
  }

  // ── Eventos ───────────────────────────────────────────────────────────
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
  $('#analizar-ahora').addEventListener('click', function () { abrirAnalisis(estado.ultimosDatos); });
  $('#ir-analisis').addEventListener('click', function (e) { e.preventDefault(); abrirAnalisis(); });
  $('#volver-inicio').addEventListener('click', function (e) {
    e.preventDefault();
    estado.fase = 'inicio';
    mostrar('paso-inicio');
  });

  $('#archivos').addEventListener('change', function (e) { if (e.target.files.length) leerArchivos(e.target.files); });
  $('#filtro-pagina').addEventListener('change', cargarPaginaAnalisis);
  $('#filtro-vista').addEventListener('change', pintarAnalisis);
  $('#filtro-radio').addEventListener('input', pintarAnalisis);
})();
