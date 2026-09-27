# Basic&Print

Sitio de serigrafía en camisetas: el cliente gira la prensa para elegir el color, pasa las pantallas para elegir el diseño y envía el pedido por WhatsApp.

## Panel de administración
Entra a `/admin` con tu correo (te llega un enlace). Desde ahí manejas:
- **Pedidos**: ver cada pedido del carrito, cambiar estado, nota interna, abrir el logo del cliente.
- **Inventario**: colores de camiseta (nombre, color, orden, visible) y existencias por talla.
- **Diseños**: subir el arte de serigrafía (PNG/SVG), nombre, categoría, tintas, visible.
- **Promociones** y **Retos** de racha.
- **Redes y ajustes**: Facebook, Instagram, TikTok, WhatsApp, mensaje de precios. Cada red aparece en el sitio cuando tiene enlace.
- **Mensajes** del formulario de contacto.
- **Equipo**: dar o quitar acceso al panel por correo.

## Páginas
- `/` Prensa: carrusel de colores (3D) + carrusel de diseños + subir logo + ubicación (frente, pecho, espalda) + tallas mezcladas → carrito → pedido guardado y WhatsApp.
- `/historia` Nosotros.
- `/comunidad` Muro de ideas (crear, editar, votar, comentar) y chat en vivo. Acceso con enlace al correo.
- `/promociones` Promociones y retos de racha con hoja de registro diaria.
- `/contacto` Formulario (se guarda en la base) y botón de WhatsApp.

Dos estilos seleccionables arriba a la derecha: Formal (minimalista) e Informal (celeste y azul).

## Tecnología
Next.js 16 · Supabase (base de datos, cuentas, tiempo real) · Vercel.

## Variables de entorno
Copia `.env.example` a `.env.local` y completa:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WHATSAPP` número con código de país, sin signos (ej. 50370001234)

## Base de datos
El esquema está en `supabase/migrations/` (0001 a 0003).
Pedidos: tabla `orders`. Mensajes de contacto: `contact_messages`. Colores, diseños, promociones y retos se editan desde el panel de Supabase (Table Editor).

## Desarrollo
```
npm install
npm run dev
```
