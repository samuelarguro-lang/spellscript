# IX. Desarrollo e implementación — ampliación de SpellScript

**Estado:** prototipo jugable de tres habitaciones; versión para revisión local antes de publicar.

## Lenguajes, herramientas y entorno

- **HTML5:** vistas del menú principal, tutorial, habitaciones, grimorio, validador y progreso.
- **CSS3:** conservación del estilo de fantasía de la primera versión; disposición adaptable, luces y animaciones de partículas y conjuros.
- **JavaScript:** catálogo de conjuros, AFD, lógica de los acertijos, guardado de progreso y música mediante Web Audio.
- **Entorno:** navegador moderno y editor de código. No se emplea un backend, base de datos ni librerías de IA.

## Estructura, módulos y funciones

| Módulo | Función |
|---|---|
| `data.js` | Catálogo de los 27 conjuros, 15 acertijos, tres habitaciones, dificultades y normalizador. |
| `afd.js` | Autómata finito determinista por caracteres y traza de reconocimiento. |
| `game.js` | Gestión de vidas, historial, intentos, progreso por habitación y cambio de dificultad. |
| `music.js` | Música ambiental original sintetizada y efectos suaves según el elemento. |
| `app.js` | Enlace de los módulos con la interfaz, tutorial guiado, navegación y retroalimentación. |
| `styles.css` | Conservación de los recursos originales y diseño responsivo de las nuevas escenas. |

## Principio de reconocimiento formal

En vez de usar inteligencia artificial para aceptar una frase, se aplica una **transformación estable y documentada**:

```javascript
function normalize(input) {
  return String(input ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[¡!¿?.,;:«»“”"'`´]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}
```

Con ello, las mayúsculas, las tildes y los signos no cambian la decisión sintáctica. Posteriormente, el AFD lee **cada carácter** de la cadena normalizada y confirma si pertenece al conjunto de 27 hechizos. Las palabras de elemento, círculo y acción siguen siendo parte obligatoria de la estructura regular.

## Reglas del juego y dificultad

Los modos Fácil, Intermedio y Difícil utilizan, respectivamente, 3/4/5 acertijos por habitación y 7/5/4 puntos de vida por sala. Se comprueba primero la validez de la cadena mediante el AFD y después si la combinación soluciona el acertijo actual. Las penalizaciones son −1 PV por sintaxis inválida y −2 PV por conjuro válido pero inadecuado. Cada acierto desbloquea la siguiente prueba de la sala. Cambiar la dificultad requiere reiniciar la campaña porque cambia el número de acertijos previstos.

## Interfaces y efectos

Se conservaron las imágenes originales `torreon_arcano.webp` y `puerta_helada.webp`. Las salas de fuego y niebla cuentan con fondos, atmósferas y pistas independientes. El tutorial explica el grimorio, la fórmula y el AFD; el usuario puede consultar el grimorio en cualquier habitación. Al lanzar un conjuro aparecen luces, runas y una descarga elemental. Una melodía suave y diferente acompaña cada sala, sintetizada dentro del navegador, con volumen configurable.

## Almacenamiento e integración

La partida usa `localStorage` cuando está disponible. No hay usuarios, servidor ni base de datos. Los módulos se integran mediante objetos JavaScript separados (`SpellData`, `SpellAFD`, `SpellGame`, `SpellMusic` y `SpellUI`). Se muestran fragmentos representativos, no páginas completas de código; el código fuente se distribuirá en el ZIP y más adelante en el repositorio al aprobar esta versión.

## Pruebas y dificultades encontradas

Se probaron las 27 combinaciones, entradas sin tildes ni signos, errores sintácticos y conjuros incorrectos, el modo Fácil/Intermedio/Difícil, el reinicio de una habitación al quedarse sin vidas y el guardado/recuperación del estado. También se realizaron revisiones visuales de menú, grimorio, las tres salas y animación de lanzamiento en escritorio y móvil. Se corrigieron dos errores detectados durante la primera revisión del prototipo ampliado: un identificador faltante en el mapa y una referencia incorrecta a la función de efectos ambientales.

La música necesita un gesto del usuario para comenzar, conforme a las restricciones habituales de reproducción automática. La variante con una IA externa fue descartada por innecesaria: la normalización y el AFD cumplen el requisito sin coste, dependencia ni interpretaciones ambiguas.
