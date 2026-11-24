# SpellScript V5 — El despertar de Aether

Versión local para revisión. Basada en el ZIP V4 aprobado. No se ha publicado en GitHub ni en Vercel.

## Iniciar
Descomprimir y abrir `index.html` en un navegador moderno. Alternativamente, ejecutar `python -m http.server 8000` en la carpeta y abrir `http://localhost:8000`. La música se activa mediante el botón de nota musical. No requiere servicios externos ni IA.

## Cambios
- `naturalSpells.js`: catálogo finito, tres variantes por combinación de elemento, intensidad y acción por dificultad (81 por modo, 243 entradas modo-frase, 216 frases distintas). AFD por caracteres, traza, patrón de contraste y diagnóstico. Las comas de las subordinadas iniciales en Difícil se conservan y exigen. Las tildes y mayúsculas se normalizan. Las tres intensidades sustituyen en la presentación a los tres círculos, sin alterar su significado en los 45 acertijos.
- `adventureTutor.js`: Aether registra intentos de aventura en el historial de aprendizaje de V4, clasifica por separado errores formales y decisiones de acertijo, mantiene contadores por reto y recomienda ayuda según dificultad: desde el primer fallo en Fácil, tercero en Intermedio, quinto en Difícil (o pistas bajo demanda). En Fácil permite construir la expresión con selectores y aplicar una corrección formal no ambigua. No revela automáticamente el conjuro que soluciona la escena. Los patrones entre ejercicios se distinguen de una racha local.
- `game.js`: selección de AFD para la forma natural, preservación de los 27 conjuros clásicos para compatibilidad, almacenamiento de versión del reconocedor para reproducir el historial. Se mantienen planes, acertijos, vidas y penalizaciones.
- `app.js`, `index.html`, `styles.css`: guía Aether, fórmulas a la vista, HUD específico por sala, cristales/pistas, resistencia del guardián, revelación de inscripciones, nuevo resumen por segmentos y acceso al recorrido académico. El entrenamiento queda dentro del grimorio, no en la portada. El compañero se coloca junto a la escena en escritorio y debajo de los controles en móvil. Animación adicional de proyectil e impacto y transiciones de indicadores.
- `afdTutor.js`, `afdVisualizer.js`: explicación de la traza natural, acceso al estado exacto y corrección contextual. Un rechazo por cadena incompleta se identifica como tal, sin inventar una transición al sumidero.
- `assets/aether.svg`: ilustración vectorial original para el compañero. Los cuatro fondos WebP originales no se modificaron.
- Progresión: XP por retos únicos, rachas, correcciones, secretos examinados y rangos. Los folios de variantes se revelan por rango; las variantes ya reconocidas no quedan prohibidas por rango. Las recompensas se almacenan en `spellscript-v5-journey`.

## Alcance y límites
El reconocedor usa vocabulario y plantillas controladas, no comprensión libre del español. Las mecánicas de las salas complementan la campaña con indicadores y pistas interactivas: no hay todavía un motor de combate o exploración independiente. Las formas complejas se enseñan especialmente en Difícil; el entrenamiento adicional sigue siendo opcional y sin vidas. El tutor es un sistema de reglas, no una IA generativa. El aprendizaje efectivo y la diversión percibida requieren evaluación con personas. Las capturas se obtuvieron en Chromium con contenido local integrado en memoria porque la política del navegador del entorno impide navegar a archivos locales; el guardado en almacenamiento se comprobó en las pruebas del motor con un sustituto de localStorage. No se midieron FPS ni se validó el audio mediante escucha humana. La versión publicada aún debe verificarse tras una eventual aprobación.

## Pruebas
`node pruebas/test_motor.cjs`, `node pruebas/test_v3.cjs`, `node pruebas/test_v4.cjs` y `node pruebas/test_v5.cjs`.
Las pruebas del motor recorren las tres dificultades y las tres habitaciones. Las comprobaciones de navegador abarcan 1440, 390 y 360 píxeles, la ayuda contextual, el constructor, las pistas y el AFD, y completan las tres salas en Fácil en escritorio con movimiento reducido. Se capturaron lanzamientos con movimiento normal en hielo y fuego. Ver `capturas_v5/qa.json` y `pruebas/RESULTADOS_V5.txt`.
