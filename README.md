# site.hahndev.com

Portfolio de Holman Hernandez, ingeniero de software en Bogotá: conocimientos, forma de trabajar, proyectos y trayectoria.

Sitio estático en HTML, CSS y JavaScript sin frameworks, publicado con GitHub Pages.

## Estructura

- `index.html`: portada, conocimientos, cómo trabajo, proyectos destacados, trayectoria y contacto.
- `projects.html`: todos los proyectos, agrupados en apps y sitios, juegos y herramientas.
- `styles.css` y `scripts.js`: fuentes; el HTML carga `styles.min.css` y `scripts.min.js`.
- `images/`: capturas de los proyectos en WebP (1280×800) e imagen para compartir (`og.png`).

## Desarrollo

```bash
bash minifica.sh               # regenera styles.min.css y scripts.min.js
python3 -m http.server 8000    # vista previa en http://localhost:8000
```
