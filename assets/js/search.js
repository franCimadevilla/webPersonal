/* ==========================================================================
   Sitio web personal — Buscador (FU-01)

   Busca en window.SEARCH_INDEX (assets/js/search-index.js, generado por
   tools/build-search-index.py) solo en el idioma de la página. Sin servidor y
   sin dependencias. El formulario es un GET normal a buscar.html?q=…: así el
   enlace a unos resultados se puede compartir, y sin JavaScript la página
   muestra un aviso con el enlace al mapa del sitio.

   - Sin distinguir mayúsculas ni tildes («busqueda» encuentra «búsqueda»).
   - Un apartado aparece si contiene todas las palabras buscadas.
   - Orden: coincidencias en el título del apartado, luego en el de la página,
     luego en el texto; a igualdad, el orden del sitio.
   - El resultado se anuncia en una región role="status".
   ========================================================================== */

(function () {
  'use strict';

  var lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  var TEXT = {
    es: {
      empty: 'Escribe una o varias palabras para buscar.',
      none: 'No hay resultados para «{q}».',
      one: '1 resultado para «{q}».',
      many: '{n} resultados para «{q}».'
    },
    en: {
      empty: 'Type one or more words to search for.',
      none: 'No results for “{q}”.',
      one: '1 result for “{q}”.',
      many: '{n} results for “{q}”.'
    }
  }[lang];

  var form = document.getElementById('search-form');
  var input = document.getElementById('search-q');
  var status = document.getElementById('search-status');
  var list = document.getElementById('search-results');
  var help = document.getElementById('search-help');
  var entries = window.SEARCH_INDEX && window.SEARCH_INDEX[lang];
  if (!form || !input || !status || !list || !entries) return;

  var ACCENTS = /[̀-ͯ]/g;

  // Minúsculas y sin tildes, carácter a carácter para que cada posición del
  // texto normalizado siga apuntando a la misma posición del original.
  function fold(text) {
    var out = '';
    var map = [];
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i).toLowerCase();
      if (ch.normalize) ch = ch.normalize('NFD').replace(ACCENTS, '');
      for (var j = 0; j < ch.length; j++) {
        out += ch.charAt(j);
        map.push(i);
      }
    }
    return { text: out, map: map };
  }

  function count(haystack, needle) {
    var n = 0;
    var at = haystack.indexOf(needle);
    while (at !== -1) {
      n++;
      at = haystack.indexOf(needle, at + needle.length);
    }
    return n;
  }

  var prepared = [];
  for (var i = 0; i < entries.length; i++) {
    prepared.push({
      entry: entries[i],
      order: i,
      page: fold(entries[i].page).text,
      heading: fold(entries[i].heading).text,
      body: fold(entries[i].text)
    });
  }

  function terms(query) {
    var words = fold(query).text.split(/\s+/);
    var out = [];
    for (var i = 0; i < words.length; i++) {
      if (words[i] && out.indexOf(words[i]) === -1) out.push(words[i]);
    }
    return out;
  }

  function search(words) {
    var found = [];
    for (var i = 0; i < prepared.length; i++) {
      var item = prepared[i];
      var score = 0;
      var all = true;
      for (var w = 0; w < words.length && all; w++) {
        var inHeading = item.heading.indexOf(words[w]) !== -1;
        var inPage = item.page.indexOf(words[w]) !== -1;
        var inBody = Math.min(count(item.body.text, words[w]), 5);
        if (!inHeading && !inPage && !inBody) all = false;
        score += (inHeading ? 10 : 0) + (inPage ? 5 : 0) + inBody;
      }
      if (all) found.push({ item: item, score: score });
    }
    found.sort(function (a, b) { return b.score - a.score || a.item.order - b.item.order; });
    return found;
  }

  // Fragmento de unos 200 caracteres alrededor de la primera coincidencia,
  // con cada palabra buscada dentro de <mark>.
  function snippet(item, words) {
    var body = item.body;
    var original = item.entry.text;
    var first = -1;
    for (var w = 0; w < words.length; w++) {
      var at = body.text.indexOf(words[w]);
      if (at !== -1 && (first === -1 || at < first)) first = at;
    }
    var start = first === -1 ? 0 : Math.max(0, body.map[first] - 60);
    var end = Math.min(original.length, start + 200);
    if (start > 0) start = original.indexOf(' ', start) + 1 || start;
    if (end < original.length) end = original.lastIndexOf(' ', end) > start ? original.lastIndexOf(' ', end) : end;

    // Rangos marcados, en posiciones del texto original.
    var ranges = [];
    for (w = 0; w < words.length; w++) {
      var from = body.text.indexOf(words[w]);
      while (from !== -1) {
        var a = body.map[from];
        var b = body.map[from + words[w].length - 1] + 1;
        if (a >= start && b <= end) ranges.push([a, b]);
        from = body.text.indexOf(words[w], from + words[w].length);
      }
    }
    ranges.sort(function (x, y) { return x[0] - y[0]; });

    var p = document.createElement('p');
    if (start > 0) p.appendChild(document.createTextNode('… '));
    var pos = start;
    for (var r = 0; r < ranges.length; r++) {
      if (ranges[r][0] < pos) continue;
      p.appendChild(document.createTextNode(original.slice(pos, ranges[r][0])));
      var mark = document.createElement('mark');
      mark.textContent = original.slice(ranges[r][0], ranges[r][1]);
      p.appendChild(mark);
      pos = ranges[r][1];
    }
    p.appendChild(document.createTextNode(original.slice(pos, end)));
    if (end < original.length) p.appendChild(document.createTextNode(' …'));
    return p;
  }

  function render(query) {
    var words = terms(query);
    list.textContent = '';
    if (help) help.hidden = true;
    if (!words.length) {
      status.textContent = TEXT.empty;
      return;
    }
    var found = search(words);
    var shown = query.replace(/\s+/g, ' ').replace(/^ | $/g, '');
    var message = found.length === 0 ? TEXT.none : found.length === 1 ? TEXT.one : TEXT.many;
    status.textContent = message.replace('{n}', found.length).replace('{q}', shown);
    if (help) help.hidden = found.length > 0;

    for (var i = 0; i < found.length; i++) {
      var entry = found[i].item.entry;
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = entry.url;
      link.textContent = entry.heading ? entry.page + ' › ' + entry.heading : entry.page;
      li.appendChild(link);
      li.appendChild(snippet(found[i].item, words));
      list.appendChild(li);
    }
  }

  function queryFromUrl() {
    var match = /[?&]q=([^&#]*)/.exec(window.location.search);
    if (!match) return '';
    try {
      return decodeURIComponent(match[1].replace(/\+/g, ' '));
    } catch (error) {
      return '';
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render(input.value);
    // La dirección refleja la búsqueda, para poder volver a ella o compartirla.
    if (window.history && window.history.replaceState) {
      var url = input.value ? '?q=' + encodeURIComponent(input.value).replace(/%20/g, '+') : window.location.pathname;
      try {
        window.history.replaceState(null, '', url);
      } catch (error) { /* file:// en algunos navegadores */ }
    }
  });

  var initial = queryFromUrl();
  if (initial) {
    input.value = initial;
    render(initial);
  }
})();
