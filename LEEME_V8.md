# SpellScript V8 — Resonancia arcana

## Inicio
Descomprime toda la carpeta. Abre index.html en Chrome o Edge; si el navegador
bloquea recursos locales, ejecuta desde esta carpeta:
    python -m http.server 8000
y abre http://localhost:8000. No hay instalación npm ni conexión a Higgsfield
durante el juego. Los archivos multimedia y librerías se incluyen localmente.

La música comienza tras una interacción; el botón ♫ y Configuración permiten
silenciarla y ajustar música, hechizos, voz de Aether y ambiente. Las animaciones
completas son predeterminadas para partidas nuevas. Puedes reducirlas o apagarlas.
Pide consejo a Aether; ya no hay un botón separado de pista.
Las runas y hazañas se consultan en Progreso o Grimorio.

## Novedades
- Cuatro videos de ambiente Seedance 2.0, con respaldo estático.
- Cuatro temas instrumentales originales generados con ElevenLabs Music v2,
  35 s cada uno, y ambientes sintetizados locales. Mezcla y transiciones Howler.
- PixiJS 8.13.2 para sprites elementales; Canvas anterior como alternativa.
- GSAP 3.13.0 para celebraciones y Howler 2.2.4 para el audio.
- Aether conserva su diseño y añade celebración Higgsfield en WebP animado.
- Combos, runas, secretos, logros opcionales, fases del guardián.
- AFD, campaña, dificultades, historial y partidas anteriores conservados.

## Límites de esta entrega
Las hazañas opcionales son logros de la campaña, no campañas nuevas.
La intensidad musical ajusta la mezcla/volumen; no se generaron stems
orquestales ni temas separados de victoria y derrota.
Aether conserva los movimientos faciales locales para diálogos y utiliza una
secuencia generada para celebrar. No hay sincronización fonética.
Los resultados de FPS dependen del equipo; en Chromium por software se
observaron cifras bajas. Los modos reducido y estático son alternativas.
Las pruebas de audio verifican reproducción, ganancia y niveles de archivos;
no constituyen una grabación de audio real escuchada en un equipo físico.

No se publicó esta versión en GitHub ni Vercel.
