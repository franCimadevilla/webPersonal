# Actividad 2 · Sitio Web Personal

## 1. Descripción general

Sitio web personal compuesto por **5 páginas** con información personal, aficiones e intereses y contenido multimedia (fotos, vídeos y podcast). Cumple los requisitos de la tarea: mínimo 5 páginas, incluye los elementos obligatorios de contenido y se desarrolla con HTML5 semántico, CSS y JavaScript puro siguiendo los estándares del W3C, de modo que pasa la validación en https://validator.w3.org/#validate_by_upload.

El sitio se reutilizará posteriormente en la asignatura **Experiencia de Usuario (UX)**, por lo que la estructura y el código deben quedar limpios, semánticos y fáciles de ampliar.

## 2. Estructura de páginas

| Página | Contenido |
| --- | --- |
| **Home** | Información personal principal |
| **Sobre mí** | Descripción detallada y aficiones/intereses |
| **Credenciales / Proyectos** | Formación, habilidades y proyectos |
| **Multimedia** | Vídeos y podcast de interés |
| **Fotos y lugares visitados** | Galería fotográfica y viajes |

### Home
- Nombre y apellidos.
- Email de contacto.
- Fotografía personal.
- Breve presentación o frase de bienvenida.
- Semántica: `header` + `main` + `figure`/`img` con `figcaption`.

### Sobre mí
- Descripción más detallada sobre mi vida y trayectoria.
- **Aficiones e intereses**: películas, deportes, música, viajes, etc., organizados por secciones temáticas.
- Datos de contacto y para mandar un coreo.
- Semántica: `article` y varias `section` (una por tema de interés).

### Credenciales / Proyectos
- Formación académica y certificaciones.
- Experiencia y habilidades técnicas/blandas.
- Proyectos personales o académicos (con enlaces o capturas de pantalla).
- Semántica: listas `ul`/`dl` para credenciales y `figure` para las capturas de proyectos.

### Multimedia (Vídeos y Podcast)
- Vídeos de interés (insertados con `<video>` o mediante incrustación).
- **Podcast de interés** incluido con `<audio controls>` y su descripción/título en `figcaption`.
- Semántica: `video`, `audio` y `figure` con `figcaption`.

### Fotos y lugares visitados
- Galería de fotografías personales.
- Lugares visitados, cada uno con una foto y una breve descripción.
- Semántica: galería de `figure`/`img` con `figcaption` agrupada en `section`.

## 3. Requisitos de contenido (checklist)

- [x] Información personal (nombre, apellidos, email) → **Home**
- [x] Fotografía personal → **Home**
- [x] Aficiones / actividades / temas de interés → **Sobre mí**
- [x] Fotos → **Fotos y lugares visitados**
- [x] Vídeos → **Multimedia**
- [x] Audios (podcast de interés) → **Multimedia**
- [x] Mínimo 5 páginas → **5 páginas**

## 4. Estilo y navegación

- **Carrusel de páginas**: una página visible cada vez, desplazándose lateralmente entre ellas.
- **Botones laterales** (flechas ‹ ›) para trasladarse a la página anterior o siguiente.
- **Indicador inferior** a modo de ubicación: puntos que señalan la página actual y permiten saltar directamente a cualquier página.
- Transiciones suaves entre páginas (CSS).
- Diseño **responsive** y navegación **accesible** (funcionamiento por teclado y atributos ARIA para el carrusel y sus controles).

## 5. Tecnologías y estándares

- **HTML5 semántico** (elementos de Web Semántica: `header`, `nav`, `main`, `section`, `article`, `figure`, `footer`).
- **CSS** para estilos, carrusel, transiciones y diseño responsive.
- **JavaScript puro** (sin frameworks) para la lógica del carrusel y la navegación.
- Cumplimiento de los estándares web vigentes del W3C y validación del HTML en https://validator.w3.org/#validate_by_upload.
- La **justificación detallada** de esta elección de tecnologías se documenta en el archivo aparte **`léeme.txt`** (requisito de la tarea).

## 6. Estructura de ficheros

```
Actividad2/
├── index.html          # Home (página 1)
├── sobre-mi.html       # Sobre mí (página 2)
├── proyectos.html      # Credenciales / Proyectos (página 3)
├── multimedia.html     # Vídeos y podcast (página 4)
├── galeria.html        # Fotos y lugares visitados (página 5)
├── assets/
│   ├── css/
│   │   └── style.css   # Estilos comunes + carrusel y diseño responsive
│   ├── js/
│   │   └── main.js     # Navegación del carrusel (botones ‹ › y atajo de teclado)
│   ├── img/
│   │   ├── foto-perfil.jpg   # Fotografía personal (Home)
│   │   └── viajes/            # Fotos de la galería
│   ├── audio/
│   │   └── podcast.mp3        # Episodio del podcast de interés (L1)
│   └── video/
│       └── demo.mp4           # Vídeo local opcional (L1)
├── léeme.txt           # Justificación de las tecnologías (requisito de la tarea)
└── README.md           # Documentación del proyecto
```

Todas las páginas comparten la misma cabecera, el carrusel inferior (flechas ‹ › + indicador de puntos) y el pie, con estilos y script comunes en `assets/`.

## 7. Pruebas de estándares (tests)

La carpeta `tests/` contiene una automatización que verifica el cumplimiento de los estándares del W3C llamando a los validadores oficiales: `validator.w3.org` (HTML) y `jigsaw.w3.org` (CSS). Se ejecuta con:

```bash
node tests/validate.mjs
```

Cada fichero `.html` y `.css` se envía al validador correspondiente (subida de fichero, igual que la opción *validate by upload*) y el script muestra errores y avisos con su número de línea, guarda un informe JSON en `tests/report/last-run.json` y devuelve código de salida `0`/`1` (válido para CI). Más detalles en `tests/README.md`.