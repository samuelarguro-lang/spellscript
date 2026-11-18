# SpellScript · Primer avance jugable

Minijuego educativo de Teoría de la Computación, Universidad de Pamplona.
**Estado:** demostración parcial; la habitación 1 está implementada y las habitaciones 2 y 3 siguen pendientes.

## Ejecutar

Abre `index.html` con Chrome o Firefox. El proyecto utiliza exclusivamente HTML, CSS y JavaScript; no hay que instalar dependencias ni configurar una base de datos.

Para desarrollo local también puedes ejecutar `python -m http.server 8000` en esta carpeta y abrir `http://localhost:8000`.

## Estructura

- `index.html`: vistas del menú, aventura, grimorio, validador y progreso.
- `css/styles.css`: diseño responsive y animaciones.
- `js/data.js`: 27 conjuros, vocabulario y reglas.
- `js/afd.js`: AFD determinista carácter por carácter.
- `js/game.js`: estado de la partida y penalizaciones.
- `js/app.js`: eventos, navegación y representación en pantalla.
- `assets/`: fondos e ilustraciones.
- `docs/`: avance documental de la sección IX.
- `tests/`: prueba automatizada y resultado del avance.

## Demostración

**Solución de la sala 1:**

`¡Aethra Ignis, despierta en el segundo círculo y rompe el sello!`

- Error sintáctico: −1 PV.
- Conjuro válido, pero no resuelve la sala: −2 PV.
- Campo vacío: sin penalización.
- Victoria: abre la puerta sin daño.
- Al llegar a 0 PV se reinicia la habitación actual con 5 PV.

El AFD acepta las 27 frases definidas y muestra transiciones reales. Las dos salas restantes aparecen bloqueadas para reflejar el avance parcial.

## Publicar en GitHub y Vercel

1. Subir el contenido de esta carpeta a un repositorio de GitHub, preferiblemente llamado `spellscript`.
2. En Vercel, usar **Add New → Project** e importar el repositorio.
3. Seleccionar **Framework Preset: Other**, **Root Directory: `./`**, sin comando de compilación ni dependencias.
4. Publicar. Vercel asignará una URL `*.vercel.app` y desplegará las nuevas versiones al actualizar la rama principal.

No se necesita backend, base de datos, variables de entorno ni claves secretas.