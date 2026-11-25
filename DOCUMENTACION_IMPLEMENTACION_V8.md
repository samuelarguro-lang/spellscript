# Desarrollo e implementación V8
Base: V7. Los módulos de reconocimiento formal y acertijos se conservan.
Se agregaron v8Backgrounds.js (carga de un único video activo y respaldo),
v8Audio.js (pistas locales, mezcla por canal, transición), v8Effects.js (sprites
texturizados, reloj, PixiJS con respaldo Canvas), v8Rewards.js (combos,
runas, logros y secretos) y css/v8.css. Se amplió companionAnimator.js con
una celebración animada transparente y se corrigió el reloj para evitar
que el tiempo de lanzamiento se estire excesivamente cuando caen los FPS.
Los medios se almacenan en assets/loops, assets/audio y assets/characters/aether.
Las dependencias se incluyen en vendor. Se conserva localStorage para la
campaña; las claves spellscript-v8-audio y spellscript-v8-rewards son independientes.
La música se activa tras una interacción y los videos se suspenden al
ocultar la pestaña o reducir efectos. Se evitan capas ambientales duplicadas
cuando hay video en reproducción. Los logros no modifican vidas ni el AFD.
Las pruebas de regresión y navegador se encuentran en pruebas/;
los resultados anteriores a la optimización se distinguen de los posteriores.
Ver LEEME_V8.md para límites.
