-- Administradoras del sitio (por correo)
create table public.admins (email text primary key, created_at timestamptz not null default now());
alter table public.admins enable row level security;
insert into public.admins (email) values ('riverav249@gmail.com') on conflict do nothing;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins a where lower(a.email) = lower(coalesce(auth.jwt()->>'email','')));
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create policy "admins ven admins" on public.admins for select to authenticated using ((select public.is_admin()));
create policy "admins agregan admins" on public.admins for insert to authenticated with check ((select public.is_admin()));
create policy "admins quitan admins" on public.admins for delete to authenticated using ((select public.is_admin()));

alter table public.designs add column if not exists image_url text;
alter table public.designs add column if not exists description text;

create table public.inventory (
  color_slug text not null references public.shirt_colors(slug) on update cascade on delete cascade,
  size text not null check (size in ('XS','S','M','L','XL','XXL','Niño')),
  stock int not null default 0 check (stock >= 0),
  primary key (color_slug, size)
);
alter table public.inventory enable row level security;
create policy "inventario publico" on public.inventory for select using (true);

alter table public.orders add column if not exists admin_note text;
insert into public.settings (key, value) values ('facebook',''),('instagram',''),('tiktok','') on conflict do nothing;

do $$
declare t text;
begin
  foreach t in array array['shirt_colors','designs','settings','promotions','challenges','inventory'] loop
    execute format('create policy "admin gestiona %1$s" on public.%1$I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end $$;

create policy "admin ve pedidos" on public.orders for select to authenticated using ((select public.is_admin()));
create policy "admin actualiza pedidos" on public.orders for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin ve lineas" on public.order_items for select to authenticated using ((select public.is_admin()));
create policy "admin ve mensajes" on public.contact_messages for select to authenticated using ((select public.is_admin()));
create policy "admin marca mensajes" on public.contact_messages for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin modera chat" on public.chat_messages for delete to authenticated using ((select public.is_admin()));
create policy "admin modera ideas" on public.ideas for delete to authenticated using ((select public.is_admin()));
create policy "admin lee todo colores" on public.shirt_colors for select to authenticated using ((select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('designs', 'designs', true, 8388608, array['image/png','image/jpeg','image/svg+xml','image/webp'])
on conflict (id) do nothing;
create policy "admin sube disenos" on storage.objects for insert to authenticated with check (bucket_id = 'designs' and (select public.is_admin()));
create policy "admin borra disenos" on storage.objects for delete to authenticated using (bucket_id = 'designs' and (select public.is_admin()));
