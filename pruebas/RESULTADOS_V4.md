# SpellScript V4 — resultados de pruebas

**Tipo de entrega:** paquete local para revisión, sin actualización de GitHub ni Vercel.

## Pruebas ejecutadas

| Prueba | Resultado observado |
|---|---|
| `node pruebas/test_motor.cjs` | PASS — 27 conjuros, motor, penalizaciones y tres dificultades. |
| `node pruebas/test_v3.cjs` | PASS — 45 acertijos, rotación, historial, recarga y reinicio de la sala. |
| `node pruebas/test_v4.cjs` | PASS — 23 respuestas educativas aceptadas, comas y conectores exigidos, tolerancia de mayúsculas y tildes, errores clasificados, recurrencia en ejercicios distintos, tutor, guardado de aprendizaje y compatibilidad V3. |
| Chromium / Playwright, 1440 × 900 | Sin errores de JavaScript ni desbordamiento horizontal en portada, práctica, AFD, grimorio y aventura; conjuro clásico aceptado con puntuación omitida. |
| Chromium / Playwright, 390 × 844 | Mismos recorridos y comprobaciones visuales, sin errores ni desbordamiento horizontal. |
| Chromium / Playwright, 360 × 800 | Mismos recorridos y comprobaciones visuales, sin errores ni desbordamiento horizontal. |
| Chromium / Playwright, 768 × 1024 | Tutorial, práctica, comprobación de conectores, alternancia de la traza y borrado separado del aprendizaje, sin desbordamiento horizontal ni errores. |
| Tutorial interactivo | Recorrido del grimorio, navegación y práctica breve de coma validados en navegador. |
| Reproducción del AFD | Avanzar, pausar, cambiar la vista sin reiniciar el paso y regresar a la práctica probados en navegador. |
| Integridad visual de V3 | Las cuatro ilustraciones originales y `data.js`, `afd.js`, `game.js` y `music.js` permanecen byte por byte idénticos al ZIP V3. |
| Almacenamiento y privacidad | Prueba en Node con almacenamiento simulado: se restaura el progreso V3, se persiste V4 y se puede borrar V4 sin tocar V3; no se guarda el texto de respuestas educativas. |

Las capturas están disponibles en `capturas_v4/`. Las comprobaciones visuales se realizaron sobre HTML, CSS, JS y recursos locales embebidos temporalmente en Chromium por restricciones del entorno de prueba con rutas locales; no son maquetas ni capturas de Vercel.

## Cobertura y límites

Los 23 ejercicios V4 están configurados explícitamente; la aceptación formal no representa comprensión del español libre. No se ha realizado una prueba sistemática de accesibilidad WCAG, auditoría de rendimiento en dispositivos físicos ni validación de aprendizaje con estudiantes. La música se activa con intervención del jugador, como en V3. Los tiempos efectivos de animación dependen del dispositivo y de las preferencias de movimiento.
