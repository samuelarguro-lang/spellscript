# SpellScript V4 · Notas para la sección IX de desarrollo e implementación

Esta actualización **amplía SpellScript V3**. No sustituye las habitaciones, los 45 acertijos, los 27 conjuros, los modos de dificultad, el autómata clásico, el guardado ni las ilustraciones. Se conserva el diseño de fantasía. El desarrollo educativo es **acotado a ejercicios configurados**; no se interpreta libremente el español.

## Lenguajes, herramientas y entorno
- **HTML5:** vistas existentes, nueva sección de taller y ampliación del grimorio y del AFD.
- **CSS3:** estilos consistentes con la V3, adaptación móvil, transiciones basadas en `transform` y `opacity`, y respetar `prefers-reduced-motion`.
- **JavaScript sin dependencias:** reconocedores deterministas, motor del juego, analizador, tutor y seguimiento local.
- **Node.js:** pruebas de motor (`pruebas/test_motor.cjs`, `pruebas/test_v3.cjs` y `pruebas/test_v4.cjs`).
- **Chromium con Playwright:** recorrido de la interfaz y capturas locales en escritorio y móvil. No hacen falta servidores, motores 3D ni IA remota para jugar.

## Estructura, módulos y clases
Las responsabilidades se organizan en funciones y objetos; **no se utilizan clases tradicionales** ni una base de datos relacional.

| Archivo | Responsabilidad |
|---|---|
| `js/data.js` | 27 frases clásicas y 45 acertijos. Sin cambios. |
| `js/afd.js` | AFD clásico, transición por carácter. Sin cambios. |
| `js/game.js` | Vidas, dificultad, historia y partida V3. Sin cambios. |
| `js/music.js` | Música y sonido originales. Sin cambios. |
| `js/app.js` | Navegación y unión entre los módulos didácticos y la interfaz; incorpora ajustes y tutorial ampliado. |
| `js/writingRules.js` | 23 ejercicios y normalización educativa que conserva comas y signos obligatorios. |
| `js/educationalAFD.js` | Construcción y ejecución del AFD de cada ejercicio, incluido un estado sumidero. |
| `js/writingAnalyzer.js` | Diagnóstico de comas, conectores, orden, palabras omitidas, signos y tildes. |
| `js/learningProgress.js` | Registro local independiente y estadísticas verificables. |
| `js/adaptiveTutor.js` | Detección de recurrencias y recomendaciones con umbrales explícitos. |
| `js/practice.js` | Evaluación de ejercicios y pistas, sin daño ni modificación de la campaña. |
| `js/afdTutor.js` | Explicación de cada transición y corrección contextual. |
| `js/afdVisualizer.js` | Reproducción, pausa, navegación y comparación de recorridos reales del AFD. |

## Fragmentos de implementación

**Normalización educativa:** convierte a minúsculas y tolera tildes y espacios extra, pero **no elimina los signos que se desean evaluar**.

```js
function normalize(input) {
  return String(input ?? '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,;:])\s*/g, '$1 ')
    .replace(/\s+/g, ' ').trim();
}
```

**Separación de la partida:** `SpellPractice.evaluate` emplea el AFD educativo y registra categorías de error en `SpellLearningProgress`, pero **no ejecuta** `SpellGame.cast` y no resta PV.

```js
const dfa = SpellEducationalAFD.run(id, text);
const analysis = SpellWritingAnalyzer.analyze(id, text, dfa);
SpellLearningProgress.record(exercise, analysis);
```

**Tutor adaptativo:** requiere, para cada categoría, por lo menos cinco intentos recientes, tres errores y tres ejercicios distintos. En una ventana posterior también puede identificar tres respuestas correctas consecutivas de la habilidad. No se infieren dificultades por un único error.

## Datos y almacenamiento
La campaña existente conserva la clave `spellscript-v3-save`. La V4 usa `spellscript-v4-learning` por separado. El registro de aprendizaje almacena identificadores de actividades, resultados, categoría de error, fecha y preferencias; **no conserva el texto escrito**. Se puede desactivar el tutor y borrar exclusivamente ese historial. Las excepciones de `localStorage` se capturan para mantener el juego funcional, aunque en ese caso no se guardan las estadísticas entre visitas.

## Interfaces e integración
El jugador puede abrir prácticas desde la portada, una sala o el grimorio. El grimorio agrega **Mi progreso como escritor** con números calculados de los intentos realizados. El nuevo panel del AFD utiliza la traza real del reconocedor para visualizar **estado de origen, símbolo leído, estado de destino y explicación**. Permite avanzar/retroceder, pausar, cambiar velocidad, ir a un paso de la traza y comparar la expresión con el modelo. El tutor del AFD explica rechazos; el tutor adaptativo revisa errores recurrentes. El tutorial incluye una práctica de puntuación.

## Dificultades encontradas y soluciones
1. **Compatibilidad de puntuación:** la V3 eliminaba los signos antes del AFD. Se incorporó `educationalAFD.js` y una normalización exclusiva para prácticas; el AFD de los 27 conjuros quedó intacto.
2. **Explicaciones poco intuitivas:** se añadió el recorrido controlable y un tutor que contextualiza cada transición con datos reales del AFD.
3. **Falsos patrones de error:** el tutor requiere errores de la misma clase en ejercicios distintos y un mínimo de intentos antes de recomendar refuerzo.
4. **Persistencia de partidas previas:** el historial de escritura se guarda con una clave nueva que nunca sobrescribe la campaña original.
5. **Carga gráfica en teléfonos:** se redujo el número de partículas en pantallas pequeñas; las animaciones tienen alternativa de movimiento reducido.

## Evidencias y limitaciones
Las suites de pruebas V2, V3 y V4 están incluidas en `pruebas/`. Las capturas reales aparecen en `capturas_v4/` y las comprobaciones se documentan en `pruebas/RESULTADOS_V4.md`. El analizador **solo evalúa estructuras definidas**. Las prácticas tienen una o varias soluciones formales enumeradas; todavía no hay evaluación pedagógica con participantes ni certificación de accesibilidad.

**Código fuente de referencia:** https://github.com/samuelarguro-lang/spellscript (todavía versión V3 en el momento de generar esta V4; no se ha publicado la V4).
