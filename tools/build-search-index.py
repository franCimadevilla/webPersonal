"""Genera assets/js/search-index.js, el índice del buscador del sitio (FU-01).

Recorre las páginas en español (raíz) y en inglés (en/), divide el <main> de
cada una por sus <section> con encabezado <h2 id> y guarda, por sección, la
URL con ancla, el título de la página, el del apartado y el texto plano.

Solo usa la biblioteca estándar de Python. El workflow de Pages lo ejecuta en
cada despliegue; en local: python tools/build-search-index.py
"""
import json
import os
import re
from html import unescape
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Las páginas que se indexan y su orden en los resultados cuando empatan.
PAGES = ['index.html', 'sobre-mi.html', 'proyectos.html', 'multimedia.html', 'galeria.html', 'ayuda.html']
OUT = os.path.join(ROOT, 'assets', 'js', 'search-index.js')


class MainParser(HTMLParser):
    """Texto del <main> partido en apartados: uno por cada <h2 id>."""

    # nav: las migas de pan. También se salta lo marcado con aria-hidden.
    SKIP = {'script', 'style', 'svg', 'nav'}
    VOID = {'img', 'br', 'hr', 'input', 'source', 'meta', 'link', 'wbr', 'track'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_main = False
        self.skip = 0
        self.h1 = None
        self.heading = None  # etiqueta de encabezado abierta (h1/h2)
        self.sections = [{'id': '', 'heading': '', 'text': []}]

    def handle_starttag(self, tag, attrs):
        """Abre un nuevo apartado en cada <h2>, empieza a saltar los subárboles
        que no aportan contenido (SKIP o aria-hidden) y recoge el alt de las
        imágenes como texto buscable.

        self.skip es un contador de profundidad: mientras sea > 0 se está
        dentro de un elemento ignorado y cada etiqueta abierta lo incrementa,
        de modo que se sabe cuándo se cierra el elemento que lo inició.
        """
        attrs = dict(attrs)
        if tag == 'main':
            self.in_main = True
        if not self.in_main or tag in self.VOID and tag != 'img':
            return
        if self.skip:
            if tag not in self.VOID:
                self.skip += 1
            return
        if tag in self.SKIP or attrs.get('aria-hidden') == 'true':
            self.skip = 1
        elif tag == 'h1':
            self.heading, self.h1 = 'h1', ''
        elif tag == 'h2':
            self.heading = 'h2'
            self.sections.append({'id': attrs.get('id', ''), 'heading': '', 'text': []})
        elif tag == 'img' and attrs.get('alt'):
            self.sections[-1]['text'].append(attrs['alt'])

    def handle_endtag(self, tag):
        """Cierra encabezados y subárboles ignorados. Al cerrar un bloque de
        texto (párrafo, elemento de lista...) añade un espacio para que las
        palabras de bloques contiguos no queden pegadas en el índice."""
        if tag == 'main':
            self.in_main = False
        if not self.in_main or tag in self.VOID:
            return
        if self.skip:
            self.skip -= 1
        elif tag in ('h1', 'h2'):
            self.heading = None
        elif tag in ('p', 'li', 'dt', 'dd', 'figcaption', 'h3', 'blockquote', 'summary'):
            self.sections[-1]['text'].append(' ')

    def handle_data(self, data):
        """Envía cada trozo de texto a su destino: el título <h1> de la página,
        el título <h2> del apartado actual o el cuerpo del apartado."""
        if not self.in_main or self.skip:
            return
        if self.heading == 'h1':
            self.h1 += data
        elif self.heading == 'h2':
            self.sections[-1]['heading'] += data
        else:
            self.sections[-1]['text'].append(data)


def clean(text):
    """Decodifica entidades HTML y deja un solo espacio entre palabras."""
    return re.sub(r'\s+', ' ', unescape(text)).strip()


def index_page(folder, page):
    """Indexa una página y devuelve una entrada por apartado.

    Cada entrada es un diccionario con:
      url     -- página y ancla del apartado (p. ej. «proyectos.html#titulo-x»),
                 para que el resultado lleve directamente a esa sección;
      page    -- nombre corto de la página, el mismo que en el menú;
      heading -- texto del <h2> del apartado ('' para el texto previo al primero);
      text    -- texto plano del apartado, ya limpio.
    Los apartados sin título ni texto se descartan.
    """
    with open(os.path.join(ROOT, folder, page), encoding='utf-8') as f:
        html = f.read()
    parser = MainParser()
    parser.feed(html)
    # Nombre corto de la página, el mismo del menú: la parte del <title> que
    # no es el nombre del autor («Proyectos · Francisco Cimadevilla»).
    m = re.search(r'<title>(.*?)</title>', html, re.S)
    parts = [clean(p) for p in m.group(1).split('·')] if m else []
    names = [p for p in parts if p != 'Francisco Cimadevilla']
    title = names[0] if names else clean(parser.h1 or '')
    entries = []
    for section in parser.sections:
        text = clean(''.join(section['text']))
        heading = clean(section['heading'])
        if not text and not heading:
            continue
        entries.append({
            'url': page + ('#' + section['id'] if section['id'] else ''),
            'page': title,
            'heading': heading,
            'text': text,
        })
    return entries


def main():
    """Genera el índice de los dos idiomas y lo escribe en assets/js.

    Estructura: {"es": [entradas...], "en": [entradas...]}. Se guarda como un
    script que asigna window.SEARCH_INDEX en lugar de un .json para que el
    navegador lo cargue con un <script> normal: no hace falta fetch y el
    buscador funciona también al abrir el sitio desde file:// sin servidor.
    El JSON va compacto (sin espacios) para que el archivo pese lo mínimo.
    """
    index = {}
    for lang, folder in (('es', ''), ('en', 'en')):
        index[lang] = [entry for page in PAGES for entry in index_page(folder, page)]
    body = json.dumps(index, ensure_ascii=False, separators=(',', ':'))
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write('/* Generado por tools/build-search-index.py: no editar a mano. */\n')
        f.write('window.SEARCH_INDEX = ' + body + ';\n')
    sizes = ', '.join(f'{lang}: {len(entries)} apartados' for lang, entries in index.items())
    print(f'{os.path.relpath(OUT, ROOT)} ({os.path.getsize(OUT) // 1024} KB; {sizes})')


if __name__ == '__main__':
    main()
