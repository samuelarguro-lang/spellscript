# SpellScript — Versión 2 · Las tres habitaciones del Torreón

**Proyecto de Teoría de la Computación · Universidad de Pamplona**

Versión jugable local del minijuego SpellScript. El aspecto del menú, el grimorio, la puerta helada y las ilustraciones originales del primer ZIP se mantiene; se amplía con tres habitaciones, retos encadenados, dificultad, tutorial, música ambiental y efectos de lanzamiento.

## Cómo probarlo

1. Descomprime el archivo ZIP.
2. Abre **`index.html`** con Chrome o Edge. No necesita instalar dependencias, servidor, cuenta, IA ni conexión a Internet.
3. Elige Fácil, Intermedio o Difícil en el menú, y pulsa **Comenzar aventura**.
4. Sigue el tutorial de cinco pasos. Incluye la visita al **grimorio**, que explica los elementos y el formato del conjuro. También puedes saltarlo.
5. Resuelve los acertijos hasta superar las **tres habitaciones**.
6. Pulsa el icono **♫** para activar música y efectos; por las políticas de los navegadores, el audio comienza solo tras un clic. En **⚙ Ajustes** puedes modificar el volumen.

Para abrirlo desde un servidor local opcional:

```bash
python -m http.server 8000
```

Abre `http://localhost:8000`.

## Dificultad

| Modo | Acertijos por habitación | Vidas por habitación | Pistas |
|---|---:|---:|---|
| Fácil / Aprendiz | 3 | 7 | Explicación directa |
| Intermedio / Aventurero | 4 | 5 | Pistas intermedias |
| Difícil / Archimago | 5 | 4 | Pistas crípticas |

Hay **15 acertijos diferentes**, cinco diseñados para cada habitación. La campaña ocupa 9, 12 o 15 acertijos según el modo. La dificultad se puede cambiar durante la sesión, **pero comenzar un modo distinto reinicia la aventura**, con una advertencia y una confirmación. Eso evita mantener progreso incompatible cuando cambia el número de enigmas.

## Las tres habitaciones

1. **La puerta helada:** rituales glaciares y apertura del sello, usando hechizos de fuego, hielo y viento.
2. **El guardián de fuego:** detener al coloso, despejar humo y abrir el crisol.
3. **La cámara de niebla:** despejar brumas, iluminar el santuario y romper el último sello.

Cada acertijo plantea una escena, una pista narrativa y una combinación de elemento, círculo y acción. No basta con acertar una sola frase para completar la habitación.

## Sintaxis amigable sin sustituir el autómata

El AFD sigue reconociendo el **lenguaje regular de 27 conjuros**, pero trabaja sobre una **normalización determinista** de la entrada. El jugador puede escribir la frase en minúsculas o mayúsculas, omitir tildes y signos de puntuación y añadir espacios extra.

Por ejemplo, estas dos frases son equivalentes:

`¡Aethra Ignis, despierta en el segundo círculo y rompe el sello!`

`aethra ignis despierta en el segundo circulo y rompe el sello`

**Importante:** no se usa IA ni se aceptan palabras arbitrarias o cambios de vocabulario. La secuencia gramatical, las palabras de los elementos, el círculo y la acción siguen siendo significativos. Se valida primero la forma normalizada con un AFD real (carácter por carácter), y después una regla independiente comprueba si el conjuro es correcto para el acertijo.

- Campo vacío: **0 PV**.
- Error de sintaxis: **−1 PV**.
- Conjuro bien formado, pero incorrecto para el acertijo: **−2 PV**.
- Conjuro correcto: avanza al siguiente acertijo.
- Llegar a 0 PV: reinicia **la habitación actual** con todas sus pruebas; las anteriores siguen completadas.

## Música y efectos

La música ambiental es **original y generada mediante Web Audio**, sin archivos MP3 ni servicios externos. El menú, la sala de hielo, la de fuego y la de niebla tienen motivos musicales distintos y discretos. El volumen puede ajustarse desde el menú de configuración. Los hechizos activan efectos de sonido suaves y animaciones de círculos, energía, runas y destellos elementales. Existe una opción para reducir las animaciones.

## Estructura del proyecto

```text
SpellScript_V2/
├── index.html
├── css/styles.css
├── js/data.js         # Lenguaje regular, normalización, dificultades y 15 enigmas
├── js/afd.js          # Autómata determinista, transiciones y trazas
├── js/game.js         # Vida, intentos, desbloqueos, capítulos y almacenamiento local
├── js/music.js        # Música y efectos originales sintetizados con Web Audio
├── js/app.js          # Tutorial, interfaz, animaciones y eventos
├── assets/            # Ilustraciones originales y nuevas habitaciones
├── pruebas/           # Pruebas del motor y reporte de calidad
└── DOCUMENTACION_AVANCE.md
```

El juego puede guardar el progreso en **`localStorage`**, si el navegador lo permite. No tiene usuarios, servidor ni base de datos remota.

## Pruebas

Con Node.js instalado, ejecuta:

```bash
node pruebas/test_motor.cjs
```

Este test verifica el conjunto completo de 27 conjuros, normalización, rechazos, penalizaciones, las tres campañas según dificultad, reinicio por agotamiento de vidas y recuperación del progreso.

## Publicación

**Esta versión 2 está preparada para revisión local y todavía NO ha sido subida a GitHub ni desplegada en Vercel.** Su publicación se realizará solamente después de la revisión y autorización del usuario.
