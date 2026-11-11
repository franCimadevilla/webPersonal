Todas las métricas están evaluadas de 0 a 10.

# Evaluador: Carlos
1. Usabilidad
1.1 Comprensibilidad global del sitio Web: mapa, migas, etc.	7			Menú principal con aria-current, puntos de carrusel y flechas laterales: muy navegable, pero triple navegación redundante y etiquetas confusas ("Página 3 de 5: Inicio", orden de numeración incoherente). Sin migas.
1.2 Mecanismos de ayuda y retroalimentación en línea	4			Atajo de flechas izquierda/derecha no anunciado al usuario; sin ayuda, sin 404 propia ni formularios con retroalimentación.
1.3 Aspectos estéticos de las interfaces	9			Diseño muy cuidado y profesional: variables CSS, tarjetas, rejilla de proyectos, cabecera con foto. Muy buena armonía.
1.4 Adaptabilidad a dispositivos móviles medido con herramientas	6			Viewport, width/height en imágenes y media query a 768 px; pero Lighthouse móvil: inicio 100, pero la galería baja a 75 con LCP de 36,5 s por fotos de 1,5-5,7 MB.
1.5 Internacionalización: Usa varios idiomas	0			Solo español (lang="es").
1.6 Enlaces a redes sociales	8			Enlaces a Gmail, GitHub y LinkedIn en el inicio y repositorios/demos en Proyectos.
2. Accesibilidad
2.1 Accesibilidad solamente con teclado sin uso de ratón	8			Elementos nativos (enlaces/botones) y atajo de teclado con flechas; no se redefine el foco (usa el del navegador, válido). El atajo no hace bucle y puede chocar con lectores de pantalla.
2.2 Navegación eliminando todos los elementos gráficos	8			Imágenes con alt descriptivo, aria-labelledby en secciones, figcaptions. Fallo menor: el SVG animado tiene alt "Typing SVG" poco informativo y depende de un servicio externo.
2.3 Comprobación automática de accesibilidad con herramientas	10			lang, alt, landmarks, aria-labels, buen contraste; jerarquía correcta. Lighthouse Accesibilidad: 100/100.
3. Funcionalidad
3.1 Calidad del buscador	0			No hay buscador.
3.2 Facilidad de navegación	7			Cinco páginas bien señalizadas y accesibles en un clic. Incoherencia: la flecha "anterior" del inicio apunta a Galería mientras el atajo de teclado no hace bucle.
4. Contenidos
4.1 Información sobre las aficiones	6			Aficiones poco explícitas: una línea sobre deporte al aire libre; el resto son intereses profesionales, galería de viajes y un podcast. Faltan aficiones personales detalladas.
4.2 Información sobre formación y experiencia laboral	8			Formación, stack tecnológico muy completo, prácticas y 4 proyectos con TFG (10/10) y enlaces. No hay fechas concretas.
4.3 Información de contacto	9			Correo, GitHub y LinkedIn en la página de inicio, bien presentados con lista de definición.
4.4 Contacto con personas que avalan a la persona	0			No hay personas que avalen ni referencias (aunque hay nota de TFG).

5. Confiabilidad
5.1 Ausencia de Deficiencias y Errores	7			Sin enlaces rotos (se comprobaron los externos). Se depende de un servicio externo (readme-typing-svg, ~2 s) que podría fallar; etiquetas del carrusel inconsistentes.
5.2 Validación de estándar HTML	10			W3C Nu HTML Checker: 0 errores y 0 avisos en las 5 páginas.
5.3 Validación de estándar CSS	10			W3C CSS Validator: style.css válido, 0 errores (1 aviso de extensión de proveedor).
5.4 Fecha de última actualización	2			Solo "© 2026" en el pie; no hay fecha de última actualización.

6. Eficiencia
6.1 Rendimiento medido con herramientas	7			Inicio ligero (~20 KB la foto), pero la galería pesa ~21 MB de JPEG sin optimizar (21 MB en total), 28 MB de vídeos. Lighthouse: inicio 100 (37 KB), pero Galería 75 con LCP 36,5 s y CLS 0,056.
6.2 Tiempo de carga del sitio Web	6			GitHub Pages ~0,4 s; el inicio espera ~2 s por el SVG externo y la galería es muy pesada. Lighthouse: inicio LCP 1,1 s móvil, 0,2 s escritorio; Galería LCP 36,5 s.

---

# Evaluador: Miguel

1. Usabilidad
1.1 Comprensibilidad global del sitio Web: mapa, migas, etc.	8			Se sabe siempre dónde estás: el menú resalta la página actual y abajo hay unos puntos y flechas que indican que son 5 páginas y permiten avanzar o retroceder. No hay mapa del sitio ni ruta tipo Inicio > Proyectos.
1.2 Mecanismos de ayuda y retroalimentación en línea	3			No hay buscador ni ayuda. Las flechas del teclado permiten pasar de página, pero no se explica en ningún sitio. No hay formulario ni mensajes de confirmación.
1.3 Aspectos estéticos de las interfaces	8			Diseño limpio y coherente, con buena tipografía y tarjetas bien ordenadas. Lo único raro es la frase animada de la portada, que se ve cortada ('Softw') según el momento.
1.4 Adaptabilidad a dispositivos móviles medido con herramientas	9			Al verla en un móvil (o reduciendo la ventana) todo se reorganiza bien: el menú pasa a dos líneas, los vídeos y las fotos se ajustan y no hay que desplazarse de lado.
1.5 Internacionalización: Usa varios idiomas	1			La web está solo en español; no hay selector de idioma ni versión en inglés.
1.6 Enlaces a redes sociales	7			Enlaces visibles en la portada a GitHub y LinkedIn, además del correo. No hay otras redes.

2. Accesibilidad
2.1 Accesibilidad solamente con teclado sin uso de ratón	8			Con la tecla Tab se llega a todo y se ve dónde está el foco. Además, las flechas izquierda y derecha cambian de página. Falta un enlace para saltar directamente al contenido.
2.2 Navegación eliminando todos los elementos gráficos	7			Las fotos tienen descripción y la información se entiende sin ellas. La frase animada de la portada solo tiene el texto alternativo 'Typing SVG', que no dice nada útil, y depende de un servicio externo. El menú funciona aunque se desactive JavaScript.
2.3 Comprobación automática de accesibilidad con herramientas	10			Probada con la herramienta Lighthouse de Chrome (F12 > Lighthouse): sin problemas de accesibilidad en las 5 páginas.

3. Funcionalidad
3.1 Calidad del buscador	0			La web no tiene buscador.
3.2 Facilidad de navegación	9			Con un clic se llega a cualquier página, hay menú arriba, flechas laterales y puntos abajo, y siempre se sabe cuál es la actual. Es la navegación más completa de las tres webs.

4. Contenidos
4.1 Información sobre las aficiones	4			Aficiones muy poco desarrolladas: una lista corta de intereses genéricos ('hacer deporte al aire libre', ML) y una galería de lugares visitados con fecha. No hay gustos personales concretos (música, cine, deporte...).
4.2 Información sobre formación y experiencia laboral	7			Aparece la formación (grado y máster), las tecnologías organizadas por tipo y cuatro proyectos con enlaces y vídeos. La experiencia laboral solo se menciona de pasada (unas prácticas) sin empresa ni fechas.
4.3 Información de contacto	8			Correo, GitHub y LinkedIn en la portada con enlaces que funcionan. No hay formulario de contacto.
4.4 Contacto con personas que avalan a la persona	0			No aparecen referencias ni personas que avalen al autor.

5. Confiabilidad
5.1 Ausencia de Deficiencias y Errores	7			No hay enlaces rotos y los vídeos y el audio funcionan. Resta la frase animada de la portada, que depende de un servicio externo y se ve cortada.
5.2 Validación de estándar HTML	10			Pasadas por el validador oficial del W3C (validator.w3.org): sin errores ni avisos en las 5 páginas.
5.3 Validación de estándar CSS	10			Hoja de estilos pasada por el validador CSS del W3C (jigsaw.w3.org/css-validator): sin errores.
5.4 Fecha de última actualización	3			Solo aparece '© 2026' en el pie; no se indica cuándo se actualizó la web por última vez.

6. Eficiencia
6.1 Rendimiento medido con herramientas	6			Con PageSpeed Insights (móvil), cuatro páginas salen en verde, pero la Galería sale en rojo por el enorme tamaño de sus fotos.
6.2 Tiempo de carga del sitio Web	4			Inicio, Sobre mí, Proyectos y Multimedia cargan casi al instante. La Galería tarda muchísimo (las 6 fotos pesan en total más de 20 MB): en un móvil con datos se queda cargando bastante rato.

---

# Evaluador: Jorge

1. Usabilidad
1.1 Comprensibilidad global del sitio Web: mapa, migas, etc.	10			El menú y los títulos permiten entender bien cómo se organiza la web.
1.2 Mecanismos de ayuda y retroalimentación en línea	8			Los números de los puntos del carrusel no coinciden con el orden de las páginas y pueden confundir.
1.3 Aspectos estéticos de las interfaces	8			El diseño es coherente, aunque las flechas y los puntos repiten la navegación del menú.
1.4 Adaptabilidad a dispositivos móviles medido con herramientas	9			Se adapta bien al móvil en Sobre mí y Proyectos, sin cortes ni desplazamiento horizontal.
1.5 Internacionalización: Usa varios idiomas	0			Solo está en español.
1.6 Enlaces a redes sociales	8			Tiene GitHub y LinkedIn, pero el texto de LinkedIn no coincide con el enlace.

2. Accesibilidad
2.1 Accesibilidad solamente con teclado sin uso de ratón	10			Se puede navegar con el teclado y ver qué elemento está seleccionado.
2.2 Navegación eliminando todos los elementos gráficos	9			Al quitar las imágenes se pierde el lema de Inicio porque su texto alternativo es demasiado genérico.
2.3 Comprobación automática de accesibilidad con herramientas	10			WAVE no detecta errores en Proyectos. Avisa de un posible encabezado y un enlace repetido.

3. Funcionalidad
3.1 Calidad del buscador	0			No tiene buscador.
3.2 Facilidad de navegación	9			Se navega bien con el menú, pero la numeración del carrusel no sigue el orden de las páginas.

4. Contenidos
4.1 Información sobre las aficiones	9			Explica sus aficiones, aunque la parte de deporte queda algo genérica.
4.2 Información sobre formación y experiencia laboral	8			Faltan las fechas de estudios y prácticas y el nombre de la empresa.
4.3 Información de contacto	10			Tiene correo de contacto y enlaces a sus perfiles profesionales.
4.4 Contacto con personas que avalan a la persona	0			No tiene referencias ni una forma de solicitarlas.

5. Confiabilidad
5.1 Ausencia de Deficiencias y Errores	7			La numeración del carrusel y el texto del enlace a LinkedIn no son correctos.
5.2 Validación de estándar HTML	10			Sin errores en Proyectos según el validador HTML del W3C.
5.3 Validación de estándar CSS	10			El validador marca dos errores de pointer-events y un aviso de fuentes. La propiedad es válida, pero el perfil CSS3 no la reconoce.
5.4 Fecha de última actualización	0			No tiene fecha de última actualización. El año del copyright no cuenta.

6. Eficiencia
6.1 Rendimiento medido con herramientas	6			Da 60 de performace en la página de galería.
6.2 Tiempo de carga del sitio Web	1			La carga es irregular. En la revisión del 6 de noviembre se midieron esperas de entre 27 y 47 segundos.

---

# Evaluador: Iyán

1. Usabilidad
1.1 Comprensibilidad global del sitio Web: mapa, migas, etc.	8			En todas la ventanas identificas donde estas gracias a la barra de navegación pero no hay migas
1.2 Mecanismos de ayuda y retroalimentación en línea	0			No hay
1.3 Aspectos estéticos de las interfaces	10			Muy visual y llamativo, se destaca en el indice el mensaje que va cambiando e imprimiendose 
1.4 Adaptabilidad a dispositivos móviles medido con herramientas	10			Se adpta perfectamente
1.5 Internacionalización: Usa varios idiomas	0			No usa varios idiomas
1.6 Enlaces a redes sociales	10			Hay enlace a su linkedln

2. Accesibilidad
2.1 Accesibilidad solamente con teclado sin uso de ratón	10			Todas las operacione spueden hacerse usando solo teclado
2.2 Navegación eliminando todos los elementos gráficos	10			Los elementos graficos no interfieren en la navegación
2.3 Comprobación automática de accesibilidad con herramientas	10			Usado google lighthouse para teléfonos y el valor de la media de las vistas

3. Funcionalidad
3.1 Calidad del buscador	0			La página no tiene ningún buscador
3.2 Facilidad de navegación	10			La página tiene navegación por barra de navegación superior, un submenú de navegación en la parte inferior y botones laterales para cambiar de vista

4. Contenidos
4.1 Información sobre las aficiones	10			Está el contenido 
4.2 Información sobre formación y experiencia laboral	10			Está el contenido 
4.3 Información de contacto	10			Hay varios correos de contacto
4.4 Contacto con personas que avalan a la persona	0			No está el contenido 

5. Confiabilidad
5.1 Ausencia de Deficiencias y Errores	10			No hay ningún error ni warning
5.2 Validación de estándar HTML	10			Usado: https://validator.w3.org/    -  0 Errores
5.3 Validación de estándar CSS	9.5			Usado: https://jigsaw.w3.org/css-validator/   - 0 Errores 1 Warning
5.4 Fecha de última actualización	0			No hay fecha de ultima actualización

6. Eficiencia
6.1 Rendimiento medido con herramientas	8,66			Medido con https://pagespeed.web.dev/, para teléfono y usando la media de todas las vistas
6.2 Tiempo de carga del sitio Web	8			Medido con https://pagespeed.web.dev/, para teléfono y usando la media de todas las vistas y el valor de "Renderizado del mayor elemento con contenido". Todos por debajo del segundo pero la de galería que tarda mas de 99.9 y por eso sube mucho la media.

---

# Evaluador: Claude Sonnet 5.5

1. Usabilidad
1.1 Comprensibilidad global del sitio Web: mapa, migas, etc.	5,5					convierte las migas en una ruta con texto (“Inicio › Proyectos”), marca la página activa en el menú y arregla las flechas “‹ ›” (en Galería, “›” lleva a Inicio).
1.2 Mecanismos de ayuda y retroalimentación en línea	2					añade un formulario de contacto o una página de ayuda, y un botón claro para volver.
1.3 Aspectos estéticos de las interfaces	6					incrusta los vídeos con reproductor y miniatura, añade imágenes a Sobre mí y Proyectos, y marca los emojis con aria-hidden.
1.4 Adaptabilidad a dispositivos móviles medido con herramientas	6,5					mide con PageSpeed/Lighthouse móvil y revisa que los botones táctiles tengan un tamaño suficiente.
1.5 Internacionalización: Usa varios idiomas	1					crea una versión en inglés con selector de idioma y declara lang en cada página.
1.6 Enlaces a redes sociales	5					repite GitHub, LinkedIn y correo en el pie de las cinco páginas, con iconos reconocibles.

2. Accesibilidad
2.1 Accesibilidad solamente con teclado sin uso de ratón	5					dale texto a los enlaces numerados y a las flechas (aria-label), añade un enlace “Saltar al contenido” y un estilo de foco visible (:focus-visible).
2.2 Navegación eliminando todos los elementos gráficos	4,5					pon texto alternativo al SVG animado y a la foto de perfil, y añade transcripción y subtítulos a vídeos y audio.
2.3 Comprobación automática de accesibilidad con herramientas	3,5					corrige los enlaces vacíos (el error más grave), lang y aria-current, y pasa WAVE o axe.

3. Funcionalidad
3.1 Calidad del buscador	0					si el sitio crece, añade un buscador sencillo (Pagefind o Lunr.js funcionan en GitHub Pages).
3.2 Facilidad de navegación	6					marca la página activa, rehaz las flechas con texto (“Anterior: Proyectos”) y nombra el contexto de cada enlace (“Repositorio de BasaltDB”).

4. Contenidos
4.1 Información sobre las aficiones	5					amplíalas con una o dos frases personales (qué deporte, qué viajes).
4.2 Información sobre formación y experiencia laboral	6					añade empresa, fechas, equipo y logros a las prácticas, y las fechas de grado y máster.
4.3 Información de contacto	6,5					pon el bloque de contacto en todas las páginas y un CV descargable.
4.4 Contacto con personas que avalan a la persona	1					incluye 2 o 3 referencias o testimonios (tutor del TFG, responsable de prácticas, compañeros), con su permiso.

5. Confiabilidad
5.1 Ausencia de Deficiencias y Errores	5,5					arregla las flechas de navegación, la errata “NotebookLLM” y el pie de foto que mezcla idiomas.
5.2 Validación de estándar HTML	5					pasa los validadores del W3C y pega el resultado.
5.3 Validación de estándar CSS	5					pasa los validadores del W3C y pega el resultado.
5.4 Fecha de última actualización	2					añade “Última actualización: dd/mm/aaaa” en el pie. Es la mejora más barata.

6. Eficiencia
6.1 Rendimiento medido con herramientas	6					comprime las fotos (WebP, máximo 1200 px) con loading="lazy", sustituye el SVG animado externo por CSS o alójalo en tu sitio, y mide con PageSpeed.
6.2 Tiempo de carga del sitio Web	7					comprime las fotos (WebP, máximo 1200 px) con loading="lazy", sustituye el SVG animado externo por CSS o alójalo en tu sitio, y mide con PageSpeed.