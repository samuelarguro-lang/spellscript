# IX. DESARROLLO E IMPLEMENTACIÓN — avance parcial

**Estado:** primer prototipo jugable. Las interfaces no son solo maquetas, pero el videojuego completo no está terminado.

### A. Lenguaje y herramientas

El prototipo usa **HTML5** para la estructura de vistas, **CSS3** para la apariencia y las animaciones, y **JavaScript** para el reconocedor AFD, las reglas del enigma y el estado de la partida. No requiere frameworks, compilación, motor 3D, registro de usuarios, base de datos ni conexión a Internet. El entorno de ejecución es un navegador web de escritorio.

### B. Estructura y módulos

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Pantallas de menú, primera habitación, grimorio, validador y progreso. |
| `css/styles.css` | Paleta oscura, marcos de fantasía, botones, efectos mágicos y adaptación a pantallas estrechas. |
| `js/data.js` | Diccionario fijo de 3 invocaciones × 3 círculos × 3 acciones = 27 cadenas y soluciones propuestas para cada sala. |
| `js/afd.js` | Autómata finito determinista con transiciones por carácter y estado sumidero. |
| `js/game.js` | Vida, intentos, penalización, victoria y reinicio. |
| `js/app.js` | Controlador de eventos, cambios de pantalla y retroalimentación visual. |

No se implementaron clases tradicionales: se utilizaron módulos de funciones y objetos para separar responsabilidades.

### C. Reconocedor formal implementado

Se genera un **trie determinista**, equivalente a un AFD finito que reconoce exactamente las 27 frases completas especificadas. Cada carácter consumido lleva a un estado único; los caracteres inesperados pasan al sumidero `q⊥`. Se acepta solo al finalizar la entrada en un estado final. Una expresión regular verifica independientemente la concordancia del reconocimiento.

Fragmento representativo (`js/afd.js`):

```javascript
function transition(state, symbol) {
  if (state === -1) return -1;
  return states[state].edges.has(symbol)
    ? states[state].edges.get(symbol)
    : -1;
}
```

### D. Reglas y estado del juego

El reconocedor no decide si el conjuro abre la puerta. Si la sintaxis es aceptada, un segundo módulo compara la terna (invocación, círculo, acción) con la solución del nivel. La primera habitación exige **(Aethra Ignis, segundo, rompe el sello)**.

Fragmento representativo (`js/game.js`):

```javascript
if (!dfa.accepted) {
  state.syntaxErrors++;
  state.lives = Math.max(0, state.lives - 1);
} else if (invocation === solution.invocation &&
           circle === solution.circle &&
           action === solution.action) {
  state.solved[0] = true;
} else {
  state.puzzleErrors++;
  state.lives = Math.max(0, state.lives - 2);
}
```

La entrada vacía no cuenta como intento ni descuenta vida; las pistas son gratuitas; cuando la vida llega a cero se restaura la habitación actual a cinco PV.

### E. Interfaces desarrolladas

Se incorporaron cinco vistas: inicio, aventura (primera habitación), grimorio, validación y mapa de progreso. El lenguaje visual emplea marcos dorados, morado, azul, pergamino y efectos de hechizo. Los fondos de fantasía son recursos gráficos originales para el proyecto, guardados localmente. Las animaciones incluyen partículas, destellos, nieve, iluminación de la puerta, sacudida al fallar y cambios de estado al acertar. Se ofrece control de movimiento reducido.

### F. Integración

La ruta de ejecución es: `interfaz → controlador → AFD → reglas de la habitación → actualizar vida/progreso → retroalimentación y vista de estados`. Todos los módulos son archivos locales de JavaScript y comparten datos mediante el objeto global `window.SpellData`, `window.SpellAFD` y `window.SpellGame`.

### G. Dificultades y soluciones iniciales

- **Expresiones largas y muchas transiciones:** en el panel se presenta una secuencia abreviada de estados, con la **tabla de transiciones completa** en una vista desplazable.
- **Diferenciar sintaxis y lógica:** se aislaron el AFD y la evaluación de cada sala para evitar que un conjuro válido se marque como inválido por no resolver el enigma.
- **Reproducción sin Internet:** los recursos gráficos, las hojas de estilo y los scripts se incluyen en la misma carpeta; no se consumen servicios externos.
- **Animación y accesibilidad:** se incorporó la opción de reducir animaciones y textos de estado independientes de los colores.

### H. Pendiente para próximas entregas

Las salas 2 y 3 aún no se pueden jugar. También están pendientes las pruebas completas de compatibilidad, una matriz de verificación exhaustiva RF/RNF y el resumen final tras superar los tres retos. No se presentan como módulos ya construidos.

> Este documento es un avance de la sección IX. El código íntegro está en los archivos fuente; aquí se muestran solo los fragmentos necesarios para explicar las decisiones de implementación.