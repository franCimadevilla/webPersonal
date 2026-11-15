/* ==========================================================================
   Análisis de las sesiones de eye tracking

   · Lista las sesiones que servidor.py ha guardado en tests/usabilidad/eyetracking/
     (y admite .json sueltos del disco).
   · La selección (sesiones, página, vista, radio…) vive en el hash de la URL:
     al recargar o compartir el enlace se ve el mismo mapa.
   · La página se pinta en un iframe con sandbox sin scripts, así no navega,
     no anima y no manda visitas a Hotjar. El mapa va en un canvas dentro del
     propio documento, con su altura completa, y se redibuja si la página
     cambia de tamaño (imágenes que terminan de cargar, fuentes…).
   ========================================================================== */

(function () {
  'use strict';

  var API = '/api/eyetracking/sesiones';
  var CARPETA = '../usabilidad/eyetracking/';
  var COLORES = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#008080', '#9a6324', '#000075'];

  var $ = function (sel) { return document.querySelector(sel); };

  var estado = {
    disponibles: [],      // metadatos de la API + sesiones locales
    datos: {},            // marca -> JSON completo
    seleccion: [],        // marcas elegidas, en orden
    pagina: '',
    vista: 'calor',
    radio: 40,
    opacidad: 75,
    pliegue: true,
    observador: null,
    pendiente: false,
  };

  // ── Estado en la URL ──────────────────────────────────────────────────
  function leerHash() {
    var q = new URLSearchParams(location.hash.slice(1));
    estado.seleccion = (q.get('s') || '').split(',').filter(Boolean);
    estado.pagina = q.get('p') || '';
    estado.vista = q.get('v') || 'calor';
    estado.radio = Number(q.get('r')) || 40;
    estado.opacidad = Number(q.get('o')) || 75;
    estado.pliegue = q.get('f') !== '0';
    $('#filtro-vista').value = estado.vista;
    $('#filtro-radio').value = estado.radio;
    $('#filtro-opacidad').value = estado.opacidad;
    $('#filtro-pliegue').checked = estado.pliegue;
  }

  function escribirHash() {
    var q = new URLSearchParams();
    if (estado.seleccion.length) q.set('s', estado.seleccion.join(','));
    if (estado.pagina) q.set('p', estado.pagina);
    q.set('v', estado.vista);
    q.set('r', estado.radio);
    q.set('o', estado.opacidad);
    if (!estado.pliegue) q.set('f', '0');
    history.replaceState(null, '', '#' + q.toString());
  }

  // ── Sesiones ──────────────────────────────────────────────────────────
  function cargarLista() {
    return fetch(API, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (lista) {
        estado.disponibles = lista.sort(function (a, b) { return String(b.inicio).localeCompare(String(a.inicio)); });
        $('#estado-lista').textContent = lista.length
          ? lista.length + ' sesión(es) en tests/usabilidad/eyetracking/'
          : 'Todavía no hay sesiones guardadas.';
      })
      .catch(function () {
        estado.disponibles = [];
        $('#estado-lista').textContent = 'Sin servidor de pruebas: arranca tests/prueba-usabilidad.ps1 o añade los .json a mano.';
      })
      .then(function () {
        // Última sesión de esta pestaña, por si no se pudo guardar en el servidor.
        try {
          var ultima = JSON.parse(sessionStorage.getItem('et-ultima') || 'null');
          if (ultima && ultima.marca && !estado.disponibles.some(function (d) { return d.marca === ultima.marca; })) {
            anadirLocal(ultima);
          }
        } catch (e) { /* sin sessionStorage */ }
      });
  }

  function anadirLocal(d) {
    var marca = d.marca || ('local-' + Date.now());
    d.marca = marca;
    estado.datos[marca] = d;
    if (!estado.disponibles.some(function (x) { return x.marca === marca; })) {
      estado.disponibles.unshift({
        marca: marca, local: true, participante: d.participante, tarea: d.tarea, inicio: d.inicio,
        duracionMs: d.duracionMs, precision: d.precision && d.precision.pct, muestras: d.muestras.length,
      });
    }
  }

  function pintarLista() {
    var ul = $('#lista-sesiones');
    ul.innerHTML = '';
    estado.disponibles.forEach(function (s) {
      var li = document.createElement('li');
      var label = document.createElement('label');
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.value = s.marca;
      input.checked = estado.seleccion.indexOf(s.marca) !== -1;
      input.addEventListener('change', alCambiarSeleccion);

      var titulo = document.createElement('span');
      titulo.className = 'titulo';
      var idx = estado.seleccion.indexOf(s.marca);
      if (idx !== -1 && estado.vista !== 'calor') {
        var punto = document.createElement('span');
        punto.className = 'color';
        punto.style.background = COLORES[idx % COLORES.length];
        titulo.appendChild(punto);
      }
      titulo.appendChild(document.createTextNode((s.participante || '?') + ' · ' + (s.tarea || s.marca)));

      var detalle = document.createElement('span');
      detalle.className = 'detalle';
      var partes = [];
      if (s.inicio) partes.push(new Date(s.inicio).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }));
      if (s.duracionMs) partes.push(Math.round(s.duracionMs / 1000) + ' s');
      if (s.precision != null) partes.push('precisión ' + s.precision + ' %');
      if (s.local) partes.push('sin guardar en disco');
      detalle.textContent = partes.join(' · ');
      if (s.video) {
        detalle.appendChild(document.createTextNode(' · '));
        var a = document.createElement('a');
        a.href = CARPETA + s.video;
        a.target = '_blank';
        a.textContent = 'vídeo';
        detalle.appendChild(a);
      }

      label.appendChild(input);
      label.appendChild(titulo);
      label.appendChild(detalle);
      li.appendChild(label);
      ul.appendChild(li);
    });
  }

  function alCambiarSeleccion() {
    estado.seleccion = Array.prototype.filter.call(document.querySelectorAll('#lista-sesiones input'), function (i) { return i.checked; })
      .map(function (i) { return i.value; });
    actualizar();
  }

  function cargarDatos(marcas) {
    return Promise.all(marcas.map(function (m) {
      if (estado.datos[m]) return estado.datos[m];
      var meta = estado.disponibles.find(function (d) { return d.marca === m; });
      if (!meta || !meta.json) return null;
      return fetch(API + '/' + encodeURIComponent(meta.json), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d) estado.datos[m] = d; return d; })
        .catch(function () { return null; });
    }));
  }

  function sesionesElegidas() {
    return estado.seleccion.map(function (m) { return estado.datos[m]; }).filter(Boolean);
  }

  // ── Páginas ───────────────────────────────────────────────────────────
  function pintarPaginas() {
    var cuenta = {};
    sesionesElegidas().forEach(function (d) {
      d.muestras.forEach(function (m) { if (m.p && m.p !== '(externa)') cuenta[m.p] = (cuenta[m.p] || 0) + 1; });
    });
    var paginas = Object.keys(cuenta).sort(function (a, b) { return cuenta[b] - cuenta[a]; });
    var sel = $('#filtro-pagina');
    sel.innerHTML = '';
    paginas.forEach(function (p) {
      var o = document.createElement('option');
      o.value = p;
      o.textContent = p + ' (' + cuenta[p] + ')';
      sel.appendChild(o);
    });
    sel.disabled = !paginas.length;
    if (paginas.indexOf(estado.pagina) === -1) estado.pagina = paginas[0] || '';
    sel.value = estado.pagina;
  }

  function actualizar() {
    return cargarDatos(estado.seleccion).then(function () {
      pintarLista();
      pintarPaginas();
      escribirHash();
      cargarPagina();
    });
  }

  // ── Iframe ────────────────────────────────────────────────────────────
  function cargarPagina() {
    var iframe = $('#sitio-analisis');
    var sesiones = sesionesElegidas();
    $('#vacio').hidden = !!(sesiones.length && estado.pagina);
    if (!sesiones.length || !estado.pagina) {
      iframe.hidden = true;
      pintarResumen([]);
      return;
    }
    iframe.hidden = false;
    // Mismo ancho de ventana que la grabación, para que la maqueta coincida.
    var vw = sesiones[0].viewport.w;
    iframe.style.width = vw + 'px';
    var destino = new URL('../../' + estado.pagina, location.href).href;
    if (iframe.dataset.cargada === destino) { programarDibujo(); return; }
    iframe.dataset.cargada = destino;
    iframe.onload = function () { prepararDocumento(vw); };
    iframe.src = destino;
  }

  function prepararDocumento(vw) {
    var doc;
    try { doc = $('#sitio-analisis').contentDocument; } catch (e) { return; }
    if (!doc || !doc.documentElement) return;

    // Lo que haría el script del <head>: reservar el hueco de las vistas previas.
    if (vw >= 1200) doc.documentElement.setAttribute('data-previews', '');

    var estilo = doc.createElement('style');
    estilo.textContent =
      'html{scroll-behavior:auto!important}' +
      // Nada es clicable: la página es solo el fondo del mapa.
      'a,button,input,select,textarea,summary,label,video,audio,iframe{pointer-events:none!important}' +
      '*{animation:none!important;transition:none!important}';
    doc.head.appendChild(estilo);

    // Las imágenes diferidas se cargan ya, para que la altura sea la definitiva.
    Array.prototype.forEach.call(doc.querySelectorAll('img[loading="lazy"]'), function (img) { img.loading = 'eager'; });
    doc.addEventListener('load', programarDibujo, true);

    if (estado.observador) estado.observador.disconnect();
    if (window.ResizeObserver) {
      estado.observador = new ResizeObserver(programarDibujo);
      estado.observador.observe(doc.body || doc.documentElement);
    }
    programarDibujo();
  }

  function programarDibujo() {
    if (estado.pendiente) return;
    estado.pendiente = true;
    requestAnimationFrame(function () { estado.pendiente = false; dibujar(); });
  }

  // ── Dibujo ────────────────────────────────────────────────────────────
  function puntosDePagina(d, pagina) {
    var w = d.viewport.w, h = d.viewport.h;
    return d.muestras.filter(function (m) {
      // Fuera de la ventana no hay nada que mirar: son errores de la estimación.
      return m.p === pagina && m.x >= 0 && m.y >= 0 && m.x <= w && m.y <= h;
    }).map(function (m) { return { t: m.t, x: m.x + m.sx, y: m.y + m.sy }; });
  }

  function dibujar() {
    var iframe = $('#sitio-analisis');
    var doc;
    try { doc = iframe.contentDocument; } catch (e) { return; }
    if (!doc || !doc.body) return;
    var sesiones = sesionesElegidas();

    // En un documento sin scripts un <canvas> no se pinta (muestra su contenido
    // alternativo): se dibuja aquí y se pone en la página como <img>.
    var capa = doc.getElementById('et-capa');
    if (!capa) {
      capa = doc.createElement('img');
      capa.id = 'et-capa';
      capa.alt = '';
      capa.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;z-index:2147483647;max-width:none';
      doc.documentElement.appendChild(capa);
    }
    // Se mide sin la capa, para que no se mida a sí misma.
    capa.style.display = 'none';
    var ancho = doc.documentElement.scrollWidth;
    var alto = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
    capa.style.display = '';
    capa.style.width = ancho + 'px';
    capa.style.height = alto + 'px';
    capa.style.opacity = String(estado.opacidad / 100);

    var lienzo = estado.lienzo || (estado.lienzo = document.createElement('canvas'));
    lienzo.width = ancho;
    lienzo.height = alto;
    var ctx = lienzo.getContext('2d');
    ctx.clearRect(0, 0, ancho, alto);

    var porSesion = sesiones.map(function (d) { return puntosDePagina(d, estado.pagina); });

    if (estado.vista === 'calor') {
      mapaDeCalor(ctx, [].concat.apply([], porSesion), ancho, alto, estado.radio);
    } else if (estado.vista === 'recorrido') {
      porSesion.forEach(function (pts, i) {
        pintarRecorrido(ctx, fijaciones(pts, estado.radio * 1.5, 150), COLORES[i % COLORES.length]);
      });
    } else {
      porSesion.forEach(function (pts, i) {
        ctx.fillStyle = COLORES[i % COLORES.length];
        pts.forEach(function (p) { ctx.fillRect(p.x - 2, p.y - 2, 4, 4); });
      });
    }

    if (estado.pliegue && sesiones.length) {
      var h = sesiones[0].viewport.h;
      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = 'rgba(0,0,0,.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(ancho, h);
      ctx.stroke();
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(0,0,0,.7)';
      ctx.fillText('pliegue (alto de la ventana grabada: ' + h + ' px)', 8, h - 6);
      ctx.restore();
    }

    var version = (estado.version || 0) + 1;
    estado.version = version;
    lienzo.toBlob(function (blob) {
      if (!blob || version !== estado.version) return; // ya hay un dibujo más nuevo
      var anterior = capa.dataset.url;
      capa.dataset.url = URL.createObjectURL(blob);
      capa.src = capa.dataset.url;
      if (anterior) URL.revokeObjectURL(anterior);
    });

    $('#leyenda').hidden = estado.vista !== 'calor';
    pintarResumen(porSesion, sesiones);
  }

  function pintarZonas(sesiones) {
    var ol = $('#zonas');
    ol.innerHTML = '';
    var total = {};
    var eventos = 0;
    (sesiones || []).forEach(function (d) {
      var z = (d.zonas || {})[estado.pagina] || {};
      Object.keys(z).forEach(function (k) { total[k] = (total[k] || 0) + z[k]; });
      eventos += ((d.hotjar && d.hotjar.eventos) || []).filter(function (e) { return e.p === estado.pagina; }).length;
    });
    var claves = Object.keys(total).sort(function (a, b) { return total[b] - total[a]; });
    if (!claves.length) {
      var li = document.createElement('li');
      li.textContent = 'Sin datos de zonas (sesiones anteriores a esta versión).';
      ol.appendChild(li);
      return;
    }
    var max = total[claves[0]];
    claves.slice(0, 10).forEach(function (k) {
      var li = document.createElement('li');
      li.appendChild(document.createTextNode(k + ' '));
      var ms = document.createElement('span');
      ms.className = 'ms';
      ms.textContent = (total[k] / 1000).toFixed(1) + ' s';
      li.appendChild(ms);
      var barra = document.createElement('span');
      barra.className = 'barra-zona';
      barra.style.width = Math.max(4, (total[k] / max) * 100) + '%';
      li.appendChild(barra);
      ol.appendChild(li);
    });
    var nota = document.createElement('li');
    nota.style.listStyle = 'none';
    nota.className = 'ms';
    nota.textContent = eventos + ' evento(s) de mirada enviados a Hotjar en esta página.';
    ol.appendChild(nota);
  }

  function pintarResumen(porSesion, sesiones) {
    var dl = $('#resumen-pagina');
    dl.innerHTML = '';
    pintarZonas(sesiones);
    if (!porSesion.length) return;
    var total = porSesion.reduce(function (a, p) { return a + p.length; }, 0);
    var tiempos = sesiones.map(function (d) { return tiempoEnPagina(d, estado.pagina); }).filter(function (t) { return t > 0; });
    var medio = tiempos.length ? tiempos.reduce(function (a, b) { return a + b; }, 0) / tiempos.length : 0;
    var hayDistintos = sesiones.some(function (d) { return d.viewport.w !== sesiones[0].viewport.w; });
    var filas = [
      ['Sesiones', sesiones.length + ' (' + tiempos.length + ' con esta página)'],
      ['Muestras', String(total)],
      ['Tiempo medio', (medio / 1000).toFixed(1) + ' s'],
      ['Ventana', sesiones[0].viewport.w + ' × ' + sesiones[0].viewport.h + ' px' + (hayDistintos ? ' (hay sesiones con otro ancho)' : '')],
    ];
    filas.forEach(function (f) {
      var dt = document.createElement('dt');
      dt.textContent = f[0];
      var dd = document.createElement('dd');
      dd.textContent = f[1];
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
  }

  function tiempoEnPagina(d, pagina) {
    var nav = d.navegacion || [];
    var t = 0;
    for (var i = 0; i < nav.length; i++) {
      if (nav[i].p !== pagina) continue;
      var fin = i + 1 < nav.length ? nav[i + 1].t : d.duracionMs;
      t += Math.max(0, fin - nav[i].t);
    }
    return t;
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
      img.data[j * 4 + 3] = Math.round(Math.min(0.85, 0.2 + v) * 255);
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

  // azul, cian, verde, amarillo, rojo (igual que la leyenda)
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
  $('#filtro-pagina').addEventListener('change', function (e) { estado.pagina = e.target.value; escribirHash(); cargarPagina(); });
  $('#filtro-vista').addEventListener('change', function (e) { estado.vista = e.target.value; escribirHash(); pintarLista(); programarDibujo(); });
  $('#filtro-radio').addEventListener('input', function (e) { estado.radio = Number(e.target.value); escribirHash(); programarDibujo(); });
  $('#filtro-opacidad').addEventListener('input', function (e) { estado.opacidad = Number(e.target.value); escribirHash(); programarDibujo(); });
  $('#filtro-pliegue').addEventListener('change', function (e) { estado.pliegue = e.target.checked; escribirHash(); programarDibujo(); });

  $('#archivos').addEventListener('change', function (e) {
    Promise.all(Array.prototype.map.call(e.target.files, function (f) {
      return f.text().then(JSON.parse).catch(function () { return null; });
    })).then(function (lista) {
      var validas = lista.filter(function (d) { return d && Array.isArray(d.muestras) && d.viewport; });
      if (validas.length < lista.length) alert('Algún archivo no era una sesión válida y se ha ignorado.');
      validas.forEach(function (d) {
        anadirLocal(d);
        if (estado.seleccion.indexOf(d.marca) === -1) estado.seleccion.push(d.marca);
      });
      e.target.value = '';
      actualizar();
    });
  });

  window.addEventListener('hashchange', function () { leerHash(); actualizar(); });

  leerHash();
  cargarLista().then(function () {
    var conocidas = estado.disponibles.map(function (d) { return d.marca; });
    estado.seleccion = estado.seleccion.filter(function (m) { return conocidas.indexOf(m) !== -1; });
    // Sin selección: la sesión más reciente.
    if (!estado.seleccion.length && estado.disponibles.length) estado.seleccion = [estado.disponibles[0].marca];
    actualizar();
  });
})();
