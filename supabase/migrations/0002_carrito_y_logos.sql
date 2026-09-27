-- Pedidos con varias líneas (carrito)
alter table public.orders alter column shirt_color drop not null;
alter table public.orders alter column design_slug drop not null;
alter table public.orders alter column size drop not null;
alter table public.orders drop constraint if exists orders_style_check;
alter table public.orders add constraint orders_style_check check (style in ('formal','informal'));
alter table public.orders add column if not exists total_items int;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  shirt_color text not null,
  design_slug text not null,
  logo_url text check (logo_url is null or logo_url like 'https://atgmxwccddbkkulfqyaf.supabase.co/storage/v1/object/public/logos/%'),
  size text not null check (size in ('XS','S','M','L','XL','XXL','Niño')),
  quantity int not null check (quantity between 1 and 500)
);
create index on public.order_items (order_id);
alter table public.order_items enable row level security;
create policy "agregar lineas" on public.order_items for insert to anon, authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.created_at > now() - interval '10 minutes'));
create policy "ver mis lineas" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 5242880, array['image/png','image/jpeg','image/svg+xml','image/webp'])
on conflict (id) do nothing;
create policy "subir logos" on storage.objects for insert to anon, authenticated with check (bucket_id = 'logos');
