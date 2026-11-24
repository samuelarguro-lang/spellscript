# SpellScript V6 — El despertar de la magia

## Alcance
Evolución de la V5 aprobada, con los 45 acertijos, 243 formas naturales (81 por dificultad), 27 conjuros históricos, 23 ejercicios de escritura, dificultad, AFD, Aether adaptativo, historial, experiencia y guardado originales. Los módulos data.js, afd.js, game.js, naturalSpells.js, adventureTutor.js y learningProgress.js no se han cambiado.

## Novedades y archivos
- `css/scenes.css`: escenarios en capas, iluminación, parallax, movimiento de Aether, reacciones y portal por elemento.
- `js/graphicsSettings.js`: configuración completa por defecto, reducida y estática, persistida en `spellscript-v6-graphics`. Se puede elegir movimiento reducido manualmente; el modo completo es predeterminado.
- `js/sceneManager.js`: composición de arquitectura, puerta/cristales/grietas, guardián separado, núcleo, runas y bruma. El progreso cambia la visibilidad y la reacción de estos elementos.
- `js/companionAnimator.js`: cuerpo, ojos, boca y aura SVG independientes. Un MutationObserver detecta cambios de diálogo y activa el movimiento de boca durante una duración estimada por texto. No es sincronización con voz grabada.
- `js/particleEngine.js` y `js/spellEffects.js`: carga, vuelo y reacción elemental Canvas 2D; máximo 92 partículas en escritorio y 48 en pantallas pequeñas. Cancelación al ocultar la página. Los fallos sintácticos tienen una animación breve; los conjuros válidos siguen la secuencia completa.
- `js/cinematicManager.js`: secuencias locales saltables mediante diálogo; entrada al torreón, despertar de Ignis y final de la niebla. Las puertas existentes tienen nuevas texturas y colores. Se dejó preparado un reproductor opcional de videos locales, pero esta entrega no incluye video generado por Higgsfield.
- `js/music.js`: señales sintetizadas para carga, lanzamiento e impacto. El audio se habilita con interacción del usuario, usando el botón ♫.
- `js/app.js` e `index.html`: integración del motor visual sin cambiar las reglas del juego. Aether aparece antes del campo de escritura en móvil.
- `assets/scenes/`: placas WebP recompuestas a partir de las ilustraciones anteriores, recortes con transparencia y recursos SVG separados. Se conservan los cuatro archivos originales. No son cuatro ilustraciones completamente nuevas; son composiciones derivadas y elementos nuevos superpuestos.

## Pruebas realizadas
Las cuatro suites previas se ejecutaron antes y después de los cambios; todas pasaron. Se añadió `test_v6_graphics.cjs`, que verifica el modo predeterminado, las tres preferencias, valores inválidos, recuperación de almacenamiento simulado y fallo de almacenamiento. Los resultados se incluyen en `pruebas/`.

En Chromium se utilizó una copia de prueba con los mismos HTML/CSS/JS y recursos incrustados, porque el navegador del entorno impide navegar directamente a file:// y a localhost. Se usó un almacenamiento de prueba en memoria. En 1440 × 900 se completó la campaña Fácil por la interfaz, se comprobó el lanzamiento animado, el AFD y la configuración. En 390 × 844 y 360 × 800 se comprobó menú, introducción, Aether, activación de audio, error de sintaxis, AFD, configuración y ausencia de desbordamiento. No se detectaron excepciones de JS en esos recorridos. Capturas en `capturas_v6/`. El portal recibió un ajuste cosmético de textura tras la primera prueba de escritorio; no se ha medido su rendimiento en un dispositivo físico.

## Limitaciones
- Higgsfield cotizó 35 créditos para una cinemática de cinco segundos. No se consumieron créditos ni se generaron videos externos sin presupuesto acordado. Se incluyen cinemáticas locales con movimiento de cámara simulado.
- No se midieron FPS en hardware físico ni se realizó una valoración auditiva subjetiva; se verificó que la activación de Web Audio y las rutas de sonido funcionan sin excepciones en las pruebas.
- El recorte del guardián es un sprite 2D derivado de la ilustración, no un personaje con rig esquelético.
- El reconocedor trabaja con vocabulario y estructuras controladas, no con español libre.
- GitHub y Vercel no fueron actualizados.

## Ejecución
Descomprime el ZIP y abre index.html en Chrome, Edge o Firefox. No requiere dependencias ni Internet. Si el navegador restringe almacenamiento de archivos locales, usa un servidor estático, por ejemplo `python -m http.server 8000` desde la carpeta del proyecto y abre `http://localhost:8000`. Para escuchar música y efectos, pulsa ♫. Ajustes permite cambiar la calidad gráfica.
