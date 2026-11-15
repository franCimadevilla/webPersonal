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

1. Arranca el servidor desde la raíz del repositorio: `python -m http.server 3000`. La cámara solo funciona en `localhost` o con HTTPS, no abriendo el archivo con doble clic.
2. Abre <http://localhost:3000/tests/eyetracking/> en Chrome o Edge, a pantalla completa (F11) y con el zoom al 100 %.
3. Escribe el participante, la tarea y la página de inicio, y pulsa **Activar la cámara**. Permite el acceso a la webcam.
4. **Calibración**: coloca la cara dentro del recuadro verde y haz 5 clics en cada uno de los 9 puntos sin dejar de mirarlos.
5. **Precisión**: mira el punto central durante 5 s. Si sale por debajo del 70 %, recalibra.
6. **Iniciar la sesión**: en el diálogo de compartir, elige **Esta pestaña**. El sitio ocupa toda la ventana y el participante hace la tarea con normalidad.
7. Para terminar, pulsa **Esc** o el botón **■ Terminar** de la esquina inferior izquierda.

Se descargan dos archivos con el nombre `et-<participante>-<tarea>-<fecha>`:

| Archivo | Contenido |
|---|---|
| `.mp4` / `.webm` | Vídeo de la pestaña con el punto de mirada y su estela. El participante no ve el punto; solo aparece en el vídeo. |
| `.json` | Muestras `{t, x, y, sx, sy, p}`: tiempo en ms, mirada en la ventana, scroll y página. También guarda la navegación, la precisión y el tamaño de la ventana. |

Guárdalos en `tests/usabilidad/eyetracking/`. **Otra tarea** reutiliza la calibración y solo repite la prueba de precisión.

## Análisis

**Analizar sesiones grabadas**, en la portada de la herramienta, carga uno o varios `.json` y los combina. Por cada página muestra:

- **Mapa de calor**: zonas más miradas, sobre la página real y a lo largo de todo su scroll.
- **Recorrido**: fijaciones numeradas por orden (algoritmo I-DT), con un color por participante. El tamaño del círculo indica la duración.

La página se muestra con el mismo ancho de ventana que se grabó, para que la maqueta coincida. El control **Radio** ajusta el suavizado.

## Limitaciones

- La precisión de una webcam ronda los 100–200 px. Sirve para comparar zonas (cabecera, tarjetas, botones), no palabras sueltas.
- Si el participante cambia de postura o de luz, la precisión baja. Recalibra entre tareas largas.
- Las páginas de fuera del sitio, como los enlaces externos, se graban como `(externa)` y sin scroll.
- Los mapas no tienen en cuenta el contenido que cambia de tamaño o de posición después de cargar, como los carruseles o los acordeones abiertos.
