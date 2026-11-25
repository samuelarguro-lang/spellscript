# SpellScript V9 — Ascensión arcana
Base única: ZIP V8 2a5d4fe8673873412d085f73f232171a144bc6915684cf8ff28a1879ade5e3ac.
Abre index.html en Chrome/Edge; si el navegador bloquea archivos locales, usa
python -m http.server 8000 y http://localhost:8000. No requiere instalar npm.
La V8 original se conserva: AFD, 45 acertijos, hechizos, dificultades, música,
Aether, recompensas y guardados. Las preferencias nuevas usan una clave aparte.
## Cambios
- Limpieza de órbitas, rombos, puntos globales y portal CSS antiguo.
- Video ambiental en alta o media calidad, respaldo estático, un decodificador
  de fondo activo. Alta: resolución nativa generada, sin reducción a 960x540.
  Automática selecciona por dimensiones de pantalla y densidad de píxeles.
- Cinemática específica y omisible para cada sala; estado final persistente
  mediante imagen de la transformación. No repite victoria al revisar el archivo.
- Resumen separado con vidas restantes, acertijos, XP del último reto y runa.
- GSAP para la entrada del resumen, Web Animations API para impactos, daño y
  transición; PixiJS para estelas curvas, efectos diferenciados y menos sprites.
- Indicador FPS con resolución y fotogramas descartados cuando hay video activo.
## Límites
Higgsfield no permitió 1080p en la modalidad ilimitada de la cuenta.
Se generaron nuevos recursos HD, en formato 4:3 para salas, y se codificaron con
CRF 18; no es Full HD ni superresolución IA. El modo medio usa 960 px de ancho.
El modo automático no prueba MediaCapabilities; es una heurística simple.
Los efectos de conjuros siguen usando sprites procedurales existentes mejorados,
no tres nuevas hojas de sprites generadas. No hay nueva animación esquelética
del guardián; su derrota combina reacción local y transformación del templo.
El movimiento y los FPS dependen del navegador y hardware. No se garantiza 60 FPS.
No se ha publicado en GitHub ni Vercel.
