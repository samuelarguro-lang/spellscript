# Informe de verificación · SpellScript v2

## Pruebas funcionales

- Reconocimiento: **27 de 27** conjuros aceptados tanto en su forma canónica como en minúsculas, sin tildes y sin signos.
- Errores: se rechazan palabras no reconocidas, círculos inexistentes y acciones mal construidas.
- AFD: **680 estados**, recorrido por carácter de las cadenas normalizadas y contraste con expresión regular.
- Vidas: campo vacío sin penalización, error sintáctico −1 PV, conjuro no pertinente −2 PV.
- Reinicio: al llegar a 0 vidas, se reinicia la habitación actual y se conserva la anterior.
- Campañas: se completaron los tres escenarios en cada modo (Fácil, Intermedio y Difícil) mediante el test automático.
- Tutorial: se comprobó el recorrido de bienvenida, apertura del grimorio y regreso al tutorial.
- Animaciones: se verificó la activación visual de `casting` con el efecto elemental.
- Música: activación por clic, volumen regulable y cambio de tema por sala.
- Persistencia: prueba automatizada con almacenamiento local simulado, incluido reinicio de motor.

Ejecutar la comprobación sin navegador:

```bash
node pruebas/test_motor.cjs
```

## Revisión visual

Se revisaron menú, habitación helada, grimorio, guardián de fuego y cámara de niebla en escritorio **1440 × 900** y móvil **390 × 844**. El ancho del documento no supera el viewport en ambas resoluciones y no se reportaron errores de JavaScript en esas rutas.

La revisión del navegador se realizó con una vista autocontenida de los mismos archivos HTML/CSS/JS y los mismos bytes de las imágenes, debido a que el entorno de validación bloquea la navegación local. No se afirma que exista todavía un despliegue público de la versión v2.

## Notas

La versión nueva es una ampliación del primer prototipo. Se respetan las imágenes `torreon_arcano.webp` y `puerta_helada.webp`. Los fondos de fuego y niebla son nuevos. La dificultad puede cambiarse desde el inicio o Ajustes, pero se advierte que la campaña se reinicia al cambiar de modo.
