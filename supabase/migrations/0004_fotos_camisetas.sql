-- Fotos reales por color de camiseta (catálogo)
alter table public.shirt_colors add column if not exists image_url text;

-- Colores con foto. Los tonos se midieron de las fotos reales enviadas por la dueña.
-- blanco y amarillo ya existían; su foto usa el mismo molde.
insert into public.shirt_colors (slug, name, hex, sort, active, image_url) values
  ('blanco',      'Blanco',       '#F2F2EF', 1,  true, '/catalogo/camisetas/blanco.webp'),
  ('negro',       'Negro',        '#131416', 2,  true, '/catalogo/camisetas/negro.webp'),
  ('marino',      'Azul marino',  '#2B364A', 3,  true, '/catalogo/camisetas/marino.webp'),
  ('rojo',        'Rojo',         '#B91A26', 4,  true, '/catalogo/camisetas/rojo.webp'),
  ('royal',       'Azul royal',   '#2158B5', 5,  true, '/catalogo/camisetas/royal.webp'),
  ('verde-olivo', 'Verde olivo',  '#777949', 6,  true, '/catalogo/camisetas/verde-olivo.webp'),
  ('amarillo',    'Amarillo',     '#F2C230', 7,  true, '/catalogo/camisetas/amarillo.webp'),
  ('gris',        'Gris jaspe',   '#989693', 8,  true, '/catalogo/camisetas/gris.webp'),
  ('morado',      'Morado',       '#7C509E', 9,  true, '/catalogo/camisetas/morado.webp'),
  ('rosado',      'Rosado',       '#F0CBC3', 10, true, '/catalogo/camisetas/rosado.webp')
on conflict (slug) do update
  set name = excluded.name, hex = excluded.hex, sort = excluded.sort,
      active = excluded.active, image_url = excluded.image_url;

-- "Verde bosque" no tiene foto: se oculta (no se borra) hasta que haya una.
update public.shirt_colors set active = false, sort = 99 where slug = 'verde';

-- Almacenamiento para fotos de productos que la dueña suba desde el panel
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
create policy "admin sube productos" on storage.objects for insert to authenticated
  with check (bucket_id = 'productos' and (select public.is_admin()));
create policy "admin borra productos" on storage.objects for delete to authenticated
  using (bucket_id = 'productos' and (select public.is_admin()));
