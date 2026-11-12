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
        if not self.in_main or self.skip:
            return
        if self.heading == 'h1':
            self.h1 += data
        elif self.heading == 'h2':
            self.sections[-1]['heading'] += data
        else:
            self.sections[-1]['text'].append(data)


def clean(text):
    return re.sub(r'\s+', ' ', unescape(text)).strip()


def index_page(folder, page):
    with open(os.path.join(ROOT, folder, page), encoding='utf-8') as f:
        html = f.read()
    parser = MainParser()
    parser.feed(html)
    title = clean(parser.h1 or '')
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
