# SpellScript V7 — Renacimiento arcano

## Alcance
Evolución incremental de la V6. Se conservaron 45 acertijos, 3 salas, 3 dificultades, vidas, penalizaciones, progreso, historial, tutor adaptativo, experiencia, grimorio y ejercicios educativos. Los 27 conjuros clásicos y las 243 expresiones naturales V5/V6 siguen reconocidos. Se incorporaron 243 expresiones más elaboradas (81 por dificultad). Las intensidades nuevas equivalen a las anteriores: un soplo de poder (leve), renovada fuerza (media), todo su poder (máxima).

## Implementación audiovisual
- Cuatro ilustraciones nuevas de fantasía pictórica, obtenidas de una composición generada específicamente para esta versión y exportadas como WebP; personajes ilustrados extraídos de conceptos generados y enmascarados manualmente. El personaje y los efectos están separados de la arquitectura; no todos los detalles de cada ilustración son capas independientes.
- `animationClock.js`: reloj monotónico con `requestAnimationFrame`, medición de intervalos y pausa al ocultar la pestaña. Los eventos de puntero almacenan el objetivo del desplazamiento; no reinician el reloj.
- `sceneManager.js`: partículas, luces, neblina, sellos, guardián, revelación y reacciones independientes. `companionAnimator.js`: flotación, parpadeo, boca aproximada y reacciones de Aether.
- `particleEngine.js` y `spellEffects.js`: concentración, lanzamiento, impacto y finalización. El controlador recibe una notificación al terminar, en vez de un temporizador independiente. Efectos de fuego, hielo y viento diferenciados por geometría y paleta. `music.js`: síntesis de carga, salida, impacto y vocalizaciones breves.
- `css/v7.css`: tratamiento pictórico, HUD más compacto, control FPS, diseño adaptable. Se quitaron las reglas globales de movimiento reducido del sistema que competían con la preferencia explícita del juego. Completa es predeterminada; reducida y desactivada son opciones persistentes.
- `naturalSpells.js`: incorpora familias de expresiones a un trie determinista, conserva las transiciones de las variantes anteriores y comprueba el resultado contra una expresión regular. Se rechazan conectores omitidos, comas obligatorias y concordancias fuera del lenguaje definido. No es comprensión libre de todo el español.

## Evidencia
- `pruebas/RESULTADOS_MOTOR_V7.txt`: seis suites aprobadas; 36 desafíos de las tres campañas ejecutados en el motor; 243 nuevas y 243 anteriores verificadas, además de las 27 clásicas.
- `pruebas/V7_*_visual.json`: pruebas del menú y de cada habitación con más de 20 segundos de reloj activo, incluyendo 8 s de movimiento continuo de puntero. Se inspeccionaron capturas y fotogramas de carga, impacto y resultado. Cada video contiene una grabación del navegador, sin sonido capturado.
- `pruebas/RESULTADOS_VISUALES_V7.json`: 1440x900, 768x1024, 390x844 y 360x800. Prueba de campaña Fácil desde la interfaz, consejo automático, AFD, audio habilitado y ajustes persistentes. El botón de rendimiento móvil fue reubicado después de las primeras grabaciones; se repitió la prueba a 360 px.
- Medición de escritorio sin grabación, muestra de 180 intervalos: 51,9 FPS en reposo y 58,4 FPS con el puntero en movimiento. Con grabación, aproximadamente 32–47 FPS según escenario. No se ha medido rendimiento en hardware físico ni se ha comprobado perceptualmente la mezcla de audio.
- Restricción del entorno: Chromium bloquea navegación a archivos locales y servidor localhost. Para QA visual se cargó una copia temporal del HTML que incrusta, sin reemplazar su lógica, los JS, CSS y recursos de los archivos originales. El ZIP mantiene los archivos separados para uso local y despliegue.

## Limitaciones y registro de generación
Higgsfield: cuenta con 10 créditos y plan Free. Se cotizó un clip Grok Video 1.5 Lite de 3 s (3 créditos); el intento de generación fue rechazado por exigir Basic o superior. No se obtuvo un clip de Higgsfield. Las cinemáticas presentes son locales y programadas; las grabaciones MP4 son evidencia del juego, no recursos cinematográficos generados. Las ilustraciones sí se generaron con ImageGen y se procesaron en el proyecto. No se incluye una animación esquelética completa ni sincronización fonética de labios: los personajes tienen animaciones de capas y movimiento facial aproximado. El guardián conserva un sistema de reacciones ligero, no un motor de combate independiente.

## Publicación
No se modificó GitHub ni Vercel. La V7 es una entrega local para revisión.
