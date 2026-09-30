---
name: Basic&Print
description: Serigrafía en camisetas configurada como un auto de lujo, en dos estilos (Élite y Juvenil).
colors:
  elite-graphite: "#141518"
  elite-graphite-raised: "#1c1e22"
  elite-panel: "#0d0e10"
  elite-warm-white: "#ece7df"
  elite-stone: "#aaa59d"
  elite-champagne: "#d9bf8c"
  elite-champagne-ink: "#17140f"
  elite-plate: "#e9e4da"
  juvenil-acid-lime: "#d4ff3d"
  juvenil-lime-light: "#e6ff8f"
  juvenil-ink: "#111204"
  juvenil-olive: "#3b4210"
  juvenil-violet: "#5b2bff"
  juvenil-papaya: "#ff5a1f"
  juvenil-cream-lime: "#f1ffcc"
  error: "#b3261e"
typography:
  display-elite:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 2.9vw, 3.1rem)"
    fontWeight: 330
    lineHeight: 1.04
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 125"
  display-juvenil:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 2.9vw, 3.1rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.4vw, 4rem)"
    fontVariation: "'wdth' 125"
  body:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.2em"
rounded:
  elite: "2px"
  elite-lg: "4px"
  juvenil: "12px"
  juvenil-lg: "20px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  band: "clamp(64px, 8vw, 120px)"
  panel-gap: "20px"
components:
  button-primary-elite:
    backgroundColor: "{colors.elite-champagne}"
    textColor: "{colors.elite-champagne-ink}"
    rounded: "{rounded.elite}"
    height: "56px"
    padding: "0 30px"
  button-primary-juvenil:
    backgroundColor: "{colors.juvenil-violet}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    height: "56px"
    padding: "0 30px"
  spec-panel-elite:
    backgroundColor: "{colors.elite-panel}"
    textColor: "{colors.elite-warm-white}"
  spec-panel-juvenil:
    backgroundColor: "{colors.juvenil-ink}"
    textColor: "{colors.juvenil-cream-lime}"
  design-plate-elite:
    backgroundColor: "{colors.elite-plate}"
    rounded: "{rounded.elite-lg}"
  design-plate-juvenil:
    backgroundColor: "{colors.juvenil-cream-lime}"
    rounded: "{rounded.juvenil-lg}"
---

# Design System: Basic&Print

## Overview

**Creative North Star: "El estudio configurador"**

La camiseta se configura como un auto de lujo. La página de inicio es un estudio con ciclorama: la camiseta gira sobre una tornamesa iluminada, un barrido de luz la cruza cada vez que cambia el diseño, y a la derecha una hoja técnica guarda la configuración. El visitante elige uno de dos estilos (selector en la cabecera, guardado en `localStorage` como `bp-theme`); ambos comparten estructura y cambian material y voz.

- **Élite**: estudio grafito ahumado con luz champán; tipografía expandida ligera en mayúsculas espaciadas; esquinas casi rectas. Para familias y empresas que esperan una marca premium.
- **Juvenil**: ciclorama lima ácido empapado con franjas de librea violeta y papaya; la misma tipografía en negra itálica; formas redondeadas y píldoras.

**Key Characteristics:**
- Ciclorama, tornamesa con aro de luz, reflejo de la prenda y barrido de luz son el mundo; no hay tarjetas de producto.
- La hoja técnica (panel oscuro) contrasta con el estudio en ambos estilos.
- Cifras tabulares (contador de color, piezas) como en una ficha técnica.
- Rechaza la grilla de tienda y la web futurista negra con neón.

## Colors

Élite es una paleta restringida: grafito y un solo acento champán. Juvenil está empapada: el lima es la superficie, el violeta la acción y el papaya solo aparece en la librea.

- **Grafito** (`#141518`): fondo de página Élite. **Panel** (`#0d0e10`): hoja técnica, proceso y pie.
- **Blanco cálido** (`#ece7df`) y **piedra** (`#aaa59d`): texto primario y secundario Élite.
- **Champán** (`#d9bf8c`): el único acento Élite: botón principal, aro de la tornamesa, selección.
- **Lima ácido** (`#d4ff3d`): superficie Juvenil y acento dentro del panel negro.
- **Tinta** (`#111204`): texto Juvenil, panel, disco de la tornamesa.
- **Violeta eléctrico** (`#5b2bff`): acción principal Juvenil y franja de librea. **Papaya** (`#ff5a1f`): solo franja de librea, nunca texto.

Dentro de `.panel`, `.process` y el pie, los tokens se reasignan (`--fg` pasa a `--ink-field-fg`, `--accent` a `--panel-accent`), así que Juvenil muestra lima sobre negro ahí.

## Typography

Una sola familia: **Archivo Variable** con eje de ancho (`@fontsource-variable/archivo/wdth.css`). La exhibición usa `font-stretch: 125%`; el texto corrido usa 100%.

- Exhibición Élite: peso 330, mayúsculas, `letter-spacing: 0.04em`, altura de línea 1.04.
- Exhibición Juvenil: peso 900 itálica, mayúsculas, `-0.015em`, altura de línea 0.9.
- Énfasis (`<em>` en el título) cambia solo el color al acento, no el estilo.
- Etiquetas: 0.66–0.78rem, peso 700, mayúsculas con tracking amplio (`--label-track`).
- Números de ficha: `font-variant-numeric: tabular-nums`, rellenados a dos cifras (03 / 08).

## Layout

- Inicio: dos columnas `1.62fr / minmax(360px, 1fr)`. El estudio es `position: sticky` a la altura de la ventana en escritorio, así la camiseta sigue a la vista mientras se llena la hoja técnica. Bajo 980px el estudio va primero y deja de ser sticky.
- Bandas con relleno `clamp(64px, 8vw, 120px)` y márgenes laterales `clamp(16px, 4vw, 56px)`.
- La gama ("Imprimimos para") es una fila de cuatro mini-estudios, dos por fila bajo 1180px.
- El proceso es una pista horizontal con nodos; se apila en móvil.

## Elevation & Depth

La profundidad viene de la luz del estudio, no de tarjetas: degradado del ciclorama, luz principal radial, sombra bajo el disco, `drop-shadow` en las camisetas y `-webkit-box-reflect` en la camiseta del frente. Los botones principales llevan una sombra suave teñida del acento. Nada de sombras duras desplazadas.

## Shapes

Élite: radios 2px / 4px, bordes de 1px. Juvenil: radios 12px / 20px, píldoras (`999px`) en botones, selector y navegación activa, bordes de 2px. Las fichas de pintura y los botones de flecha son siempre círculos.

## Components

- **Tornamesa** (`Builder.tsx › Press`): anillo 3D (`rotateY`) con arrastre, flechas y teclado; disco elíptico con aro `--rim`; nombre del color, contador tabular y fila de **fichas de pintura** (radiogroup) debajo.
- **Barrido de luz** (`.light-sweep`): un solo paso de 1.2s por selección de diseño o ubicación; la impresión se revela de izquierda a derecha (`.ink-pull`, clip-path).
- **Placas de diseño** (`.screen-frame .mesh`): carrusel horizontal; la placa activa lleva aro de acento y un reflejo que la cruza. Los diseños de ejemplo muestran la etiqueta "ejemplo".
- **Hoja técnica** (`.spec-sheet`): Color, Diseño, Ubicación y Piezas en cuatro celdas con filetes; dos por fila en móvil.
- **Botón principal** (`.squeegee`, nombre heredado): relleno de acento, texto de exhibición, reflejo que lo cruza al pasar el cursor.
- **Selector de estilo** (`.style-switch`): Élite / Juvenil con ficha de color; el pedido guarda Élite como `formal` y Juvenil como `informal` por la restricción de la base de datos.

## Do's and Don'ts

- **Do** mostrar siempre la camiseta armada antes del pedido.
- **Do** mantener un solo momento de luz por selección, con `cubic-bezier(0.16, 1, 0.3, 1)`; con movimiento reducido el barrido se oculta.
- **Do** marcar como "ejemplo" todo diseño, premio o contenido de muestra.
- **Don't** agregar neón brillante ni halos de color sin desplazamiento.
- **Don't** usar papaya para texto ni el violeta sobre el panel negro.
- **Don't** poner etiquetas pequeñas (kickers) encima de los títulos.
