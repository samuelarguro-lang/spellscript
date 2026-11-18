# Comprobaciones funcionales y visuales — SpellScript (avance)

## Verificaciones automáticas

Las comprobaciones se realizaron en Chromium automatizado con Playwright, renderizando los archivos HTML, CSS, JavaScript y recursos gráficos del proyecto. Se verificó que:

- Las 27 frases del repertorio son reconocidas por el AFD.
- El reconocedor y la expresión regular independiente coinciden en las 27 frases admitidas y en ejemplos con errores.
- Un error sintáctico descuenta 1 PV; una frase sintácticamente válida pero incorrecta descuenta 2 PV.
- La entrada vacía no descuenta PV.
- El conjuro correcto desbloquea la primera habitación y registra 1 de 3 retos superados.
- Se muestran las transiciones de cada carácter y el estado final.
- Al agotar cinco PV se reinicia la habitación con cinco puntos.
- No se detectaron excepciones de JavaScript durante la prueba.
- No hubo desplazamiento horizontal indeseado en las vistas de escritorio y móvil comprobadas.

Resultado detallado: `resultado_pruebas.json`.

## Inspección visual

Capturas efectivamente renderizadas:

- `01_inicio.png`: pantalla inicial de escritorio.
- `02_puerta_helada.png`: pantalla de juego en la primera habitación.
- `03_grimorio.png`: dos páginas del grimorio.
- `04_validacion_rechazo.png`: resultado de un conjuro inválido.
- `05_validacion_aceptada.png`: resultado del conjuro correcto, recorrido real del AFD.
- `06_progreso.png`: progreso tras superar la primera habitación.
- `07_movil_inicio.png`: pantalla inicial con dimensiones móviles.
- `08_movil_sala.png`: primera habitación con dimensiones móviles.

Los diseños se revisaron para asegurar continuidad cromática y tipográfica, disponibilidad de los controles, ausencia de superposiciones importantes y lectura de los mensajes. Son capturas del programa ejecutable, **no** imágenes generadas que simulen estar funcionando.

## Limitación actual

No se declara compatibilidad exhaustiva en todos los dispositivos, navegadores o lectores de pantalla; estas verificaciones corresponden al primer avance.
