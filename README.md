# SpellScript — primer avance jugable

Proyecto académico de **Teoría de la Computación**, Universidad de Pamplona. Prototipo web local, basado en el documento de diseño *SpellScript(3).pdf*.

## Cómo ejecutarlo

1. Descomprime el ZIP.
2. Abre **index.html** con Chrome o Firefox. No necesitas instalar nada ni conectarte a Internet.
3. Pulsa **Comenzar aventura** para entrar a la habitación 1.
4. Visita **Grimorio**, escribe un conjuro en la sala, pulsa **Lanzar conjuro** y abre **Ver el recorrido del autómata**.

También puedes servir la carpeta con `python -m http.server 8000` y abrir http://localhost:8000.

## Qué funciona en este avance

- Menú principal con arte de la torre, botones y efectos flotantes.
- Sala 1: **La puerta helada**, con campo de texto, cinco puntos de vida, pista gratuita, grimorio y efectos de éxito o fallo.
- Grimorio de las tres invocaciones, tres círculos, tres acciones y fórmula obligatoria.
- Reconocedor **AFD real** carácter por carácter: estados, transiciones, rechazo en el primer carácter no admitido, estado sumidero y visualización detallada del recorrido.
- Contraste automático con una expresión regular independiente; 27 conjuros aceptados.
- Comprobación separada de la solución de la sala (no se confunde pertenencia al lenguaje con victoria).
- Error sintáctico −1 PV; frase válida pero inadecuada −2 PV; entrada vacía 0 PV; pista 0 PV; reinicio de la sala a los 0 PV.
- Pantalla de progreso con las tres habitaciones representadas. **La segunda y tercera están bloqueadas porque todavía no están implementadas**.
- Controles mediante teclado; `Ctrl+Enter` para lanzar, `Escape` para cerrar diálogos, opción para reducir movimiento.
- Todo local, sin servidor, cuentas, bibliotecas de terceros ni base de datos.

## Ejemplos para probar

**Correcto para habitación 1:**

`¡Aethra Ignis, despierta en el segundo círculo y rompe el sello!`

**Válido sintácticamente pero no abre la puerta:**

`¡Aethra Ignis, despierta en el tercer círculo y rompe el sello!`

**Inválido:**

`¡Aethra Ignus, despierta en el segundo círculo y rompe el sello!`

Cualquier error en signos, tildes, mayúsculas, espacios y la forma exacta causará rechazo sintáctico.

## Estructura

```text
SpellScript_Primer_Avance/
├── index.html                  # Pantallas HTML
├── css/styles.css              # Estilos, animaciones y diseño responsive
├── js/data.js                  # Vocabulario cerrado y reglas de salas
├── js/afd.js                   # AFD carácter a carácter (trie determinista)
├── js/game.js                  # Estado local, vidas y decisiones de sala
├── js/app.js                   # Renderización, navegación y eventos
├── assets/torreon_arcano.webp # Arte original para la portada
├── assets/puerta_helada.webp  # Arte original para el primer nivel
├── DOCUMENTACION_AVANCE.md    # Sección IX basada en lo implementado
└── pruebas/                   # Capturas y resultados de pruebas
```

## Alcance y limitaciones

El reconocedor es un **AFD de caracteres** construido a partir del conjunto finito de 27 frases. La interfaz resume los estados en círculos para facilitar su lectura, pero ofrece el recorrido completo en una lista desplazable. El número de estados depende de los prefijos compartidos, no debe confundirse con los diagramas ilustrativos `q0 → q1 → q2 → qf` de las maquetas iniciales.

La función principal se documenta aquí de modo incremental: quedan pendientes las salas 2 y 3 jugables, el resumen final de una partida completa y la verificación formal exhaustiva en distintos navegadores/dispositivos.
