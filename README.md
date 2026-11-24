# ✧ SpellScript V3 — El Torreón de las Lenguas

Videojuego educativo de **Teoría de la Computación**. Versión de revisión, construida sobre el diseño e ilustraciones de la V2. Incluye tres salas, dificultades, tutorial, grimorio y reconocedor AFD.

## Cómo abrirlo

1. Descomprime el ZIP y abre `SpellScript_V3/index.html` con Chrome, Edge o Firefox.
2. Selecciona **Fácil**, **Intermedio** o **Difícil**. En la primera partida se abrirá el tutorial.
3. Consulta el **Grimorio** para conocer las 27 combinaciones aceptadas.
4. Resuelve los acertijos. Puedes activar música suave con el botón **♫**.
5. Para revisar el AFD de una sala superada, abre **Progreso → Revisar archivo AFD** o haz clic en su nombre en la columna izquierda de la aventura.

No necesita instalar dependencias, contar con acceso a Internet, usar un servidor ni configurar una base de datos. Si el navegador restringe almacenamiento local en `file://`, inicia un servidor local con `python -m http.server 8000` dentro de la carpeta y abre `http://localhost:8000`.

## ¿Qué es nuevo?

**Acertijos variables.** Cada sala dispone de **15 desafíos posibles (45 en total)**. Al iniciar una campaña se eligen 3, 4 o 5 por sala según la dificultad. Se mezclan, se evita repetir un acertijo en la misma partida y la selección rota entre campañas sin reutilizar los anteriores mientras queden suficientes retos disponibles. Las pistas corresponden a cada acertijo, no a un orden fijo. Los conjuros correctos son siempre combinaciones del lenguaje original de 27 frases.

**Archivo y retroceso.** Al completar una sala puedes volver a su ambientación, escoger cualquier acertijo ya resuelto y consultar el recorrido **real, carácter por carácter** que hizo el AFD. Los conjuros se guardan con su acertijo y sala; la revisión no consume puntos de vida, no cambia la sala activa ni repite la recompensa. Los usuarios que importen un guardado antiguo de V2 sin historial verán un **ejemplo canónico identificado** en lugar de un intento histórico inventado.

**Animaciones.** El lanzamiento ahora utiliza dos círculos de runas que giran, haz de energía, partículas dispersas y destello elemental. Cada acierto muestra una celebración visual y una breve melodía cuando el audio está activo. Al completar todos los retos de una sala aparece un **portal cuyas puertas se abren**; el botón para avanzar se habilita solo cuando termina la secuencia. El modo de movimiento reducido respeta la preferencia del sistema.

**Audio.** Composiciones ambientales sintetizadas localmente para hielo, fuego y niebla, con señales de acierto y apertura. El audio solo suena después de activarlo voluntariamente.

**AFD y escritura flexible.** La normalización permite omitir tildes, signos y mayúsculas. El AFD **sí** sigue exigiendo las palabras, los círculos y las acciones del lenguaje de 27 conjuros; no se incorpora IA externa.

## Dificultades

| Modo | Retos/sala | Vidas/sala | Ayuda |
|---|---:|---:|---|
| Fácil · Aprendiz | 3 | 7 | Pistas detalladas |
| Intermedio · Aventurero | 4 | 5 | Pistas moderadas |
| Difícil · Archimago | 5 | 4 | Pistas crípticas |

Cualquier error de sintaxis cuesta **−1 PV**. Una frase válida que no resuelve el acertijo cuesta **−2 PV**. Al agotar vidas se reinicia la sala actual, sin perder las salas anteriores. Cambiar dificultad pide confirmación y empieza una campaña nueva, con nuevos acertijos. El progreso se almacena en `localStorage` cuando está disponible.

## Estructura técnica

- `index.html` — pantallas, controles, archivo, escena de hechizos y portal.
- `css/styles.css` — diseño responsive y animaciones con CSS.
- `js/data.js` — 27 conjuros válidos, 45 acertijos escritos y tres modos.
- `js/afd.js` — reconocedor determinista y recorrido carácter por carácter.
- `js/game.js` — selección de retos, rotación, estado, historial y guardado.
- `js/music.js` — música ambiental y señales de recompensa sintetizadas.
- `js/app.js` — navegación, formularios, archivo y efectos visuales.
- `assets/` — ilustraciones originales del castillo y hielo, más los escenarios de fuego y niebla.
- `capturas/` — capturas reales tomadas en navegador de las pantallas principales.
- `pruebas/` — pruebas automatizadas y reporte de resultados.

## Cómo ejecutar las pruebas

Desde la carpeta `SpellScript_V3`, con Node.js instalado:

```bash
node pruebas/test_motor.cjs
node pruebas/test_v3.cjs
```

Esta entrega es una **versión para revisión local**. **No se ha actualizado GitHub ni Vercel** con V3; la publicación se realiza únicamente después de tu aprobación.

---

## SpellScript V4 — Módulos didácticos (versión para revisión)

Esta edición conserva todas las escenas y mecánicas de la V3, incluyendo los 27 conjuros y 45 acertijos; añade **23 ejercicios de escritura en español** (orden de palabras, expresiones completas, conectores, puntuación y AFD educativo).

**Cómo ejecutar:** abre `index.html` en Chrome, Edge o Firefox; no requiere instalación, IA externa ni red. Entra en **Practicar escritura sin perder vidas** desde la portada, en **Practicar escritura de esta sala** desde la aventura o en el botón del nuevo panel **Mi progreso como escritor** dentro del grimorio. El panel de validación del AFD ahora tiene reproducción, pausa, pasos, velocidad, explicación por transición y corrección contextual.

**Cómo funciona la escritura:** los **conjuros clásicos** siguen admitiendo omisión de signos, variaciones de mayúsculas y tildes. En el **Taller de escritura**, el AFD reconoce cada respuesta según un patrón explícito que conserva comas y conectores obligatorios. Un analizador identifica categorías de errores y un tutor propone refuerzos solo con evidencia repetida. No es una IA de lenguaje libre. Los ejercicios **no gastan vidas**.

**Privacidad y compatibilidad:** `spellscript-v3-save` sigue conservando la campaña actual. El historial educativo vive en `spellscript-v4-learning`, guarda categorías y resultados, **no las frases del usuario**, y se puede borrar por separado en Ajustes. También se pueden desactivar las recomendaciones. Si el navegador no permite almacenamiento, el juego continúa sin guardar las estadísticas educativas.

**Pruebas ejecutables:**

```bash
node pruebas/test_motor.cjs
node pruebas/test_v3.cjs
node pruebas/test_v4.cjs
```

Evidencias visuales: `capturas_v4/`. Descripción de módulos, fragmentos de código y dificultades: `DOCUMENTACION_IMPLEMENTACION_V4.md`. Resultados: `pruebas/RESULTADOS_V4.md`.

**Limitaciones conocidas:** el sistema reconoce respuestas previamente definidas, no corrige español abierto ni acepta todas las paráfrasis posibles. La mejora de aprendizaje requiere evaluación posterior con estudiantes. No se ha publicado V4 en GitHub ni en Vercel: este ZIP es para revisión.

## V5 — Aether y magia en español
Abre `index.html`. Las fórmulas visibles en cada sala cambian con la dificultad; Aether da consejos durante los intentos. Las prácticas complementarias están en el grimorio. Consulta `DOCUMENTACION_IMPLEMENTACION_V5.md` y las capturas de `capturas_v5/`.

## V6 — El despertar de la magia
Animaciones completas por defecto, escenarios en capas, Aether expresivo, efectos Canvas y cinemáticas locales saltables. Consulta `DOCUMENTACION_IMPLEMENTACION_V6.md` y `pruebas/RESULTADOS_*V6*` para los cambios y límites de las comprobaciones. Abre `index.html`, activa ♫ para el audio y usa Ajustes para modificar el movimiento.
