---
name: Basic&Print
description: Taller de camisetas donde el cliente diseña la suya jugando; la página toma el color de su camiseta.
colors:
  paper: "#f4f4f1"
  white: "#ffffff"
  ink-black: "#141416"
  graphite: "#55565c"
  ink-default: "#2450b8"
  error: "#b3261e"
  whatsapp: "#1faa53"
  sticker-bed: "#f1f1ee"
typography:
  display:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.6vw, 4.2rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 112"
  headline:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.1
    fontVariation: "'wdth' 112"
  body:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.1em"
  shirt-text-divertida:
    fontFamily: "Bungee, sans-serif"
    fontWeight: 400
rounded:
  sm: "8px"
  md: "12px"
  lg: "22px"
  shirt-focus: "24px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  band: "clamp(64px, 8vw, 120px)"
  panel: "clamp(18px, 2.4vw, 32px)"
components:
  button-primary:
    backgroundColor: "var(--ink)"
    textColor: "var(--ink-fg)"
    rounded: "{rounded.pill}"
    height: "56px"
    padding: "0 28px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  tool-panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-black}"
    padding: "{spacing.panel}"
  sticker:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "8px"
  dark-band:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.paper}"
---

# Design System: Basic&Print

## Overview

**Creative North Star: "El taller de juego"**

La página de inicio es un taller donde el cliente diseña su propia camiseta jugando. A la izquierda está el escenario con una camiseta grande y realista; a la derecha, cuatro herramientas numeradas (Color, Diseño, Texto, Tallas). Todo lo demás es papel claro y tinta negra, para que la camiseta sea lo único con color fuerte.

La sorpresa viene del comportamiento, no de la decoración: al elegir un color la tinta inunda el escenario y **todo el sitio adopta ese color** (botones, subrayados, contadores). Los diseños se estampan con un golpe y una salpicadura, se arrastran y se agrandan sobre la tela, el cliente escribe su nombre en tres estilos de letra y le da la vuelta a la camiseta para diseñar la espalda. Al pedir, una pasada de luz "imprime" la prenda.

**Key Characteristics:**
- Un solo estilo claro y accesible para todo público; el color lo pone el cliente.
- La camiseta es la protagonista; la interfaz es blanca, negra y en píldoras.
- Una acción a la vez: pestañas numeradas y un botón "Siguiente".
- Movimiento con propósito: inundación de tinta, estampado, giro y pasada de impresión; nada más.

## Colors

Paleta restringida: papel y tinta negra. El único acento es `--ink`, que toma el color de la camiseta elegida.

- **Papel** (`#f4f4f1`): fondo del sitio. **Blanco** (`#ffffff`): panel de herramientas, calcomanías, campos.
- **Tinta negra** (`#141416`): texto, pestaña activa, navegación activa, bandas oscuras y pie.
- **Grafito** (`#55565c`): texto secundario.
- **`--ink`** (dinámico; por defecto `#2450b8`): botón principal, subrayado de la pestaña activa, contador del carrito, selección de texto. Se calcula en `Studio.tsx`: si la camiseta es muy clara (blanca), `--ink` pasa a tinta negra para no perder contraste; `--ink-fg` se elige por luminancia.
- **Tinte del escenario**: 30 % del color de la camiseta sobre papel; para camisetas claras, gris `#d7d8d4`.
- **Error** `#b3261e` y **WhatsApp** `#1faa53` solo en sus componentes.

## Typography

**Archivo Variable** con eje de ancho. Títulos a peso 800 y 112 % de ancho, en minúsculas con tracking `-0.025em`; texto a 400. Etiquetas de datos en mayúsculas pequeñas con tracking de 0.1em. Cifras tabulares en contadores.

Para el texto que el cliente pone en la camiseta hay tres estilos: **Deportiva** (Archivo 900 itálica expandida), **Elegante** (Archivo 300 expandida, espaciada) y **Divertida** (Bungee).

## Layout

- Taller: dos columnas `1fr / minmax(360px, 440px)`. El escenario es sticky a la altura de la ventana en escritorio.
- Bajo 980px: el escenario queda sticky arriba (46svh) y las pestañas se pegan debajo, así la camiseta siempre está a la vista; al cambiar de herramienta la página se acomoda sola.
- Bandas con relleno `clamp(64px, 8vw, 120px)`; gama de cuatro ejemplos (dos por fila en pantallas medianas).

## Elevation & Depth

Casi plano. La profundidad es de la camiseta: luz de estudio, pliegues, sombra propia y una sombra elíptica en el piso. Las calcomanías se levantan un poco al pasar el cursor. Los botones principales llevan una sombra suave teñida de `--ink`.

## Shapes

Píldoras (`999px`) para botones, navegación, selector frente/espalda y chips. Tarjetas y campos a 12px; bandas de ejemplo a 22px. Fichas de color y tintas en círculo.

## Components

- **Camiseta** (`Shirt.tsx`): vector con luz de estudio, volumen en bordes, mangas, pliegues, tejido fino, costuras y cuello acanalado. Acepta capas propias (`children`) bajo la tela y controles (`overlay`) encima.
- **Escenario** (`Studio.tsx`): inundación de tinta (`clip-path` circular), selector Frente/Espalda con punto cuando ese lado tiene diseño, giro 3D de la prenda, botón "Dar la vuelta".
- **Capas**: diseño o logo y texto por lado; se arrastran con el puntero, se escalan con el asa o el control de tamaño, y con el teclado (flechas, + y −).
- **Calcomanías**: cuadrícula de diseños con filtro por categoría; la primera casilla sube el logo del cliente.
- **Tallas y resumen**: existencias por color y talla; resumen con camiseta, frente, espalda y piezas; botón "Imprimir y agregar al pedido".

## Do's and Don'ts

- **Do** dejar que el color de la camiseta sea el único color fuerte de la pantalla.
- **Do** mostrar una herramienta a la vez y siempre la camiseta armada.
- **Do** marcar como "ejemplo" todo diseño o premio de muestra.
- **Don't** agregar fondos decorativos, degradados o texturas detrás de la camiseta.
- **Don't** usar rebotes en botones o menús; el único gesto elástico es el estampado.
- **Don't** poner etiquetas pequeñas encima de los títulos.
