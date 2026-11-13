"""Pone en el pie de todas las páginas la fecha del último commit (CF-04).

Cambia el <time> que sigue a «Última actualización:» (ES, dd/mm/aaaa) o a
«Last updated:» (EN, «12 November 2026»). El workflow de Pages lo ejecuta en
cada despliegue, así que la fecha publicada no se queda atrás aunque nadie
la toque a mano. Solo usa la biblioteca estándar de Python.

Uso: python tools/stamp-date.py [AAAA-MM-DD]   (sin fecha: la del último commit)
"""
import glob
import os
import re
import subprocess
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
          'August', 'September', 'October', 'November', 'December']
FOOTER = re.compile(r'(Última actualización:|Last updated:) <time datetime="[^"]*">[^<]*</time>')


def last_commit_date():
    out = subprocess.run(['git', 'log', '-1', '--format=%cs'], cwd=ROOT,
                         capture_output=True, text=True, check=True).stdout.strip()
    return date.fromisoformat(out)


def stamp(match, day):
    label = match.group(1)
    text = (f'{day.day:02d}/{day.month:02d}/{day.year}' if label.startswith('Última')
            else f'{day.day} {MONTHS[day.month - 1]} {day.year}')
    return f'{label} <time datetime="{day.isoformat()}">{text}</time>'


def main():
    day = date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else last_commit_date()
    changed = 0
    pages = glob.glob(os.path.join(ROOT, '*.html')) + glob.glob(os.path.join(ROOT, 'en', '*.html'))
    for path in sorted(pages):
        with open(path, encoding='utf-8', newline='') as f:
            html = f.read()
        new, n = FOOTER.subn(lambda m: stamp(m, day), html)
        if n == 0:
            print(f'Aviso: {os.path.relpath(path, ROOT)} no tiene la fecha en el pie', file=sys.stderr)
        if new != html:
            with open(path, 'w', encoding='utf-8', newline='') as f:
                f.write(new)
            changed += 1
    print(f'Fecha {day.isoformat()}: {changed} de {len(pages)} páginas cambiadas')


if __name__ == '__main__':
    main()
