# Resultados de comprobación — SpellScript V3

**Verificaciones del motor:** `node pruebas/test_motor.cjs` y `node pruebas/test_v3.cjs`.

- Catálogo: 27/27 conjuros válidos reconocidos y cadenas inválidas rechazadas.
- Banco narrativo: 15 acertijos por habitación, 45 en total.
- Selección: sin repeticiones de un mismo acertijo dentro de una partida y rotación de secuencias entre partidas.
- Campaña: recorridos completos en Fácil (3 por sala), Intermedio (4) y Difícil (5).
- Historial: cada conjuro archivado puede recorrerse con el AFD real sin modificar vidas ni avance.
- Guardado: conserva progreso, planes y respuestas históricas.
- Penalizaciones: −1 PV por error sintáctico, −2 por selección válida equivocada; reinicio local al agotar vidas.

**Comprobación en navegador:** se ejecutaron pruebas de Chromium sobre el HTML, CSS, scripts e ilustraciones del proyecto integrados en una página de prueba aislada (sin red). Se revisaron tutorial, sonido activado por el usuario, animación de conjuro, recompensa por acierto, secuencia de apertura, avance bloqueado hasta terminar la apertura, navegación a salas anteriores, cambio de acertijo archivado, recorridos del AFD, regreso sin pérdida de vidas y victoria final.

**Resoluciones verificadas:** 1440 × 900, 390 × 844, 360 × 800, 768 × 1024 y 1280 × 720. En los casos probados no hubo errores de JavaScript ni desbordamiento horizontal. Capturas en `capturas/`.

**Alcance:** una suite de pruebas automatizadas no sustituye pruebas con jugadores reales; en dispositivos o navegadores adicionales podrían surgir diferencias. El archivo es una versión de revisión y no se ha publicado en GitHub ni Vercel.
