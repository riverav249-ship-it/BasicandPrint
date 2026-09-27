# Basic&Print · Design

## World
Screen-print workshop. The home page is a rotary press (pulpo): shirts rotate in 3D and the chosen design is "pulled" onto the front shirt with a squeegee pass. Registration marks (circle + cross) mark corners and steps; screen frames with mesh hold the design choices; the primary button is a squeegee (flat blade with a handle).

## Styles (switchable by the visitor, stored in localStorage `bp-theme`)
| Token | Informal (default) | Formal |
|---|---|---|
| --bg | #9fdcff celeste | #f5f6f7 cool white |
| --bg-2 | #c4e9ff | #ffffff |
| --fg | #0a1a3d navy | #111316 |
| --fg-2 | #1f3c78 | #5a606a |
| --accent | #1d4fe0 royal blue | #1f3fd1 blue |
| --ink-field (panel, process band, chat) | #0b2360 navy | #ffffff |
| --panel-accent | #6cd0ff | #1f3fd1 |
| --blade (button blade/handle) | #0a1a3d | #111316 |
| Display face | Big Shoulders Display 900, uppercase | Bodoni Moda 700, italic emphasis |
| Radius | 6 / 10 px | 2 / 3 px |

Body face: Archivo (variable), self-hosted via Fontsource.

## Components
- **Shirt** (`components/Shirt.tsx`): vector tee with shared filters (`ShirtDefs`): multiply shadows, screen highlights, knit noise, dashed stitching, ribbed collar; print sits under the folds with a slight fabric displacement. Placements: frente, pecho, espalda (back view silhouette).
- **Press**: CSS 3D ring, drag / arrows / keyboard; opacity falls off with angle.
- **Screens**: horizontal mesh-frame carousel; supports built-in SVG art, uploaded design images and the customer's logo.
- **Size grid**: per-size steppers, inventory-aware ("Agotada").
- **Cart drawer**: right sheet, lines with mini shirts, WhatsApp checkout.
- **Squeegee button** `.squeegee`: accent fill, blade shadow, handle `::before`.

## Motion
Exponential ease-out `cubic-bezier(0.16, 1, 0.3, 1)`. One ink moment per selection: squeegee pass + clip-path reveal of the print. Reduced motion disables animation.

## Rasters
None shipped; all shirt and design art is vector code. Customer logos and admin-uploaded designs live in Supabase Storage (`logos`, `designs`).
