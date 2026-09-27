# Basic&Print

Sitio de serigrafía en camisetas: el cliente gira la prensa para elegir el color, pasa las pantallas para elegir el diseño y envía el pedido por WhatsApp.

## Páginas
- `/` Prensa: carrusel de colores (3D) + carrusel de diseños + talla y cantidad → hoja de orden → pedido guardado y WhatsApp.
- `/historia` Nosotros.
- `/comunidad` Muro de ideas (crear, editar, votar, comentar) y chat en vivo. Acceso con enlace al correo.
- `/promociones` Promociones y retos de racha con hoja de registro diaria.
- `/contacto` Formulario (se guarda en la base) y botón de WhatsApp.

Tres estilos seleccionables arriba a la derecha: Formal, Informal y Teens.

## Tecnología
Next.js 16 · Supabase (base de datos, cuentas, tiempo real) · Vercel.

## Variables de entorno
Copia `.env.example` a `.env.local` y completa:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WHATSAPP` número con código de país, sin signos (ej. 50370001234)

## Base de datos
El esquema completo está en `supabase/migrations/0001_init.sql`.
Pedidos: tabla `orders`. Mensajes de contacto: `contact_messages`. Colores, diseños, promociones y retos se editan desde el panel de Supabase (Table Editor).

## Desarrollo
```
npm install
npm run dev
```
