# Eye tracking con WebGazer.js

Herramienta local para grabar hacia dónde miran los participantes mientras usan el sitio, con la webcam del portátil.
Usa [WebGazer.js](https://webgazer.cs.brown.edu/) 3.5.3 (GPLv3, gratuito). La imagen de la cámara se procesa en el propio navegador y no sale del equipo.

## Instalación (una vez)

```bash
bash tests/eyetracking/instalar-webgazer.sh
```

Descarga `webgazer@3.5.3` desde npm en `tests/eyetracking/vendor/webgazer/`, con el script y los modelos de MediaPipe FaceMesh (unos 19 MB).
Esa carpeta está en `.gitignore`: no se versiona y no se publica en GitHub Pages.

## Uso

La forma más sencilla es el script, desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File tests\prueba-usabilidad.ps1 -Participante P01 -Tarea "T1 Encontrar el CV"
powershell -ExecutionPolicy Bypass -File tests\prueba-usabilidad.ps1 -SoloAnalisis
```

El script instala WebGazer si falta y arranca [`servidor.py`](servidor.py) en `http://localhost:3000`. Después abre la herramienta en Chrome o Edge y, al terminar, abre la página de análisis. El servidor sigue activo hasta que pulses Enter.

Opciones: `-Pagina proyectos.html`, `-Navegador edge`, `-Puerto 3001` y `-VerificarHotjar`. Sin el script: `python tests/eyetracking/servidor.py 3000` y abre <http://localhost:3000/tests/eyetracking/>.

1. Pulsa F11 (pantalla completa) y deja el zoom al 100 %. La cámara solo funciona en `localhost`, no abriendo el archivo con doble clic.
2. Pulsa **Activar la cámara** y permite el acceso a la webcam.
3. **Calibración**: coloca la cara dentro del recuadro verde y haz 5 clics en cada uno de los 9 puntos sin dejar de mirarlos.
4. **Precisión**: mira el punto central durante 5 s. Si sale por debajo del 70 %, recalibra.
5. **Iniciar la sesión**: en el diálogo de compartir, elige **Esta pestaña**. El participante hace la tarea con normalidad.
6. Para terminar, pulsa **Esc** o **■ Terminar**. Espera a ver «Guardado en tests/usabilidad/eyetracking/».

Cada sesión produce dos archivos con el nombre `et-<participante>-<tarea>-<fecha>`. `servidor.py` los guarda directamente en `tests/usabilidad/eyetracking/`. Si la herramienta se sirve con otro servidor, como `python -m http.server`, se descargan y el script los recoge de Descargas.

| Archivo | Contenido |
|---|---|
| `.mp4` / `.webm` | Vídeo de la pestaña con el punto de mirada y su estela. El participante no ve el punto; solo aparece en el vídeo. |
| `.json` | Muestras `{t, x, y, sx, sy, p}`: tiempo en ms, mirada en la ventana, scroll y página. También guarda la navegación, la precisión y el tamaño de la ventana. |

**Otra tarea** reutiliza la calibración y solo repite la prueba de precisión.

## Análisis: `analisis.html`

<http://localhost:3000/tests/eyetracking/analisis.html> lista las sesiones guardadas. Puedes marcar una o varias, que se combinan, y añadir `.json` sueltos del disco. Por cada página muestra:

- **Mapa de calor**: zonas más miradas, sobre la página real y a lo largo de todo su scroll.
- **Recorrido**: fijaciones numeradas por orden (algoritmo I-DT), con un color por participante. El tamaño del círculo indica la duración.
- **Muestras sueltas**: cada estimación de la mirada.

También muestra el **pliegue** (lo que se veía sin hacer scroll), el tiempo medio en la página y un enlace al vídeo de cada sesión.

Para que el mapa no se pierda ni se descuadre:

- La selección se guarda en la URL (`#s=…&p=…&v=…`). Al recargar o volver al enlace se ve el mismo mapa.
- La página se carga sin su JavaScript (iframe con `sandbox`). No navega con ← →, no se anima y no envía visitas falsas a Hotjar. Los enlaces no se pueden pulsar.
- Se muestra con el mismo ancho de ventana que se grabó y se redibuja cuando cambia de altura (imágenes que terminan de cargar, fuentes).
- Se descartan las estimaciones que caen fuera de la ventana.

## Con Hotjar en la misma prueba

Las páginas del sitio llevan la etiqueta de Contentsquare/Hotjar, y siguen grabando cuando la herramienta las carga en su iframe. Una sola sesión produce así dos registros:

- **WebGazer**: hacia dónde mira el participante.
- **Hotjar**: clics, movimiento del ratón y scroll.

Para cruzarlos, cada sesión lleva una marca `et-<participante>-<tarea>-<fecha>` en tres sitios:

- el nombre de los archivos;
- la URL inicial (`?et=<marca>`);
- un evento de página `eyetracking:<marca>`.

En Hotjar, filtra las grabaciones por URL que contenga `et=` o por ese evento.

### Qué se envía a Hotjar

Hotjar no admite vídeos externos ni puntos de mirada en sus mapas de calor. El vídeo y las muestras se quedan en disco, y los mapas de mirada se ven en `analisis.html`. En su lugar, la herramienta resume la mirada en datos que Hotjar sí entiende. Usa la API de la etiqueta de Contentsquare (`window._uxa`) y, si existe, también `hj('event')`.

| Dato | Comando | Para qué sirve en Hotjar |
|---|---|---|
| `et_marca`, `et_participante`, `et_tarea` | `trackDynamicVariable` | Segmentar: «solo las sesiones de eye tracking», «solo P03», «solo la tarea T2». |
| `et_precision` (número) | `trackDynamicVariable` | Descartar sesiones mal calibradas: `et_precision > 70`. |
| `eyetracking:<marca>` | `trackPageEvent` | Encontrar la grabación de una sesión concreta. |
| `mirada:<zona>` | `trackPageEvent` | Se envía cuando una zona acumula 1 s de mirada en una página vista. Sirve para filtrar grabaciones del tipo «miró el CV y no hizo clic» o «nunca miró la sección de proyectos». |

Las zonas salen de la estructura del HTML. Para cada muestra se toma el elemento que hay bajo la mirada y se busca la zona con nombre más interior:

- `enlace:<texto>` para enlaces y botones;
- `tarjeta:<título>` para `article` y `figure`;
- `seccion:<encabezado>` para las `section`;
- `titulo`, `nav:<etiqueta>`, `cabecera`, `pie` y `contenido`.

Para nombrar una zona a mano, añade `data-aoi="cta-cv"` a cualquier elemento del sitio.

Límites de Contentsquare: 40 eventos por página vista, de los que la herramienta usa como mucho 30, y 255 caracteres por evento. Con la precisión de una webcam, de 100 a 200 px, los eventos fiables son los de zonas grandes (secciones, tarjetas, cabecera), no los de enlaces sueltos.

El `.json` guarda el tiempo mirado por zona y la lista de eventos enviados. La página de análisis los muestra en **Zonas más miradas**.

## Limitaciones

- La precisión de una webcam ronda los 100–200 px. Sirve para comparar zonas (cabecera, tarjetas, botones), no palabras sueltas.
- Si el participante cambia de postura o de luz, la precisión baja. Recalibra entre tareas largas.
- Las páginas de fuera del sitio, como los enlaces externos, se graban como `(externa)` y sin scroll.
- Los mapas no tienen en cuenta el contenido que cambia de tamaño o de posición después de cargar, como los carruseles o los acordeones abiertos.
