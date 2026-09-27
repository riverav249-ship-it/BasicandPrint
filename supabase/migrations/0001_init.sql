-- Basic&Print: esquema inicial
-- Catálogo, pedidos, comunidad (chat + ideas), promociones, retos de racha, contacto.

create extension if not exists pgcrypto;

-- ─────────────── Catálogo ───────────────
create table public.shirt_colors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  hex text not null,
  sort int not null default 0,
  active boolean not null default true
);

create table public.designs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,          -- coincide con el arte en /lib/designs.tsx
  name text not null,
  category text not null default 'general',
  ink_note text,                      -- ej. "2 tintas"
  is_sample boolean not null default true,
  sort int not null default 0,
  active boolean not null default true
);

create table public.settings (
  key text primary key,
  value text not null
);

-- ─────────────── Perfiles (clientes con cuenta) ───────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'nickname',''), split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────── Pedidos ───────────────
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  phone text not null check (char_length(phone) between 7 and 20),
  shirt_color text not null,
  design_slug text not null,
  size text not null check (size in ('XS','S','M','L','XL','XXL','Niño')),
  quantity int not null check (quantity between 1 and 500),
  notes text check (char_length(notes) <= 500),
  style text check (style in ('formal','informal','teens')),
  status text not null default 'nuevo' check (status in ('nuevo','confirmado','en_produccion','entregado','cancelado'))
);

-- ─────────────── Comunidad ───────────────
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  body text not null check (char_length(body) between 1 and 400)
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  title text not null check (char_length(title) between 3 and 80),
  description text check (char_length(description) <= 600),
  shirt_color text,
  design_slug text,
  votes_count int not null default 0,
  comments_count int not null default 0
);

create table public.idea_votes (
  idea_id uuid references public.ideas(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (idea_id, user_id)
);

create table public.idea_comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  body text not null check (char_length(body) between 1 and 400)
);

create index on public.idea_votes (user_id);
create index on public.idea_comments (idea_id);
create index on public.idea_comments (user_id);
create index on public.ideas (user_id);
create index on public.chat_messages (user_id);
create index on public.chat_messages (created_at desc);
create index on public.orders (user_id);

create or replace function public.refresh_idea_counts()
returns trigger language plpgsql security definer set search_path = '' as $$
declare target uuid := coalesce(new.idea_id, old.idea_id);
begin
  update public.ideas i set
    votes_count = (select count(*) from public.idea_votes v where v.idea_id = target),
    comments_count = (select count(*) from public.idea_comments c where c.idea_id = target)
  where i.id = target;
  return null;
end $$;

create trigger idea_votes_count after insert or delete on public.idea_votes
  for each row execute function public.refresh_idea_counts();
create trigger idea_comments_count after insert or delete on public.idea_comments
  for each row execute function public.refresh_idea_counts();

-- ─────────────── Promociones y retos ───────────────
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  badge text,                 -- ej. "2x1", "-15%"
  code text,
  ends_at date,
  is_sample boolean not null default true,
  active boolean not null default true,
  sort int not null default 0
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  goal_days int not null check (goal_days > 0),
  prize text not null,
  is_sample boolean not null default true,
  active boolean not null default true,
  sort int not null default 0
);

create table public.checkins (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  day date not null default ((now() at time zone 'America/El_Salvador')::date),
  primary key (user_id, challenge_id, day)
);
create index on public.checkins (challenge_id);

-- Racha actual del usuario conectado para cada reto
create or replace function public.my_streaks()
returns table (challenge_id uuid, streak int, checked_today boolean)
language sql stable security invoker set search_path = '' as $$
  with today as (select (now() at time zone 'America/El_Salvador')::date as d),
  days as (
    select c.challenge_id, c.day,
           c.day - (row_number() over (partition by c.challenge_id order by c.day))::int as grp
    from public.checkins c where c.user_id = auth.uid()
  ),
  runs as (
    select challenge_id, grp, count(*)::int as len, max(day) as last_day
    from days group by challenge_id, grp
  )
  select r.challenge_id,
         case when r.last_day >= (select d from today) - 1 then r.len else 0 end,
         r.last_day = (select d from today)
  from runs r
  where r.last_day = (select max(last_day) from runs r2 where r2.challenge_id = r.challenge_id);
$$;

-- ─────────────── Contacto ───────────────
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 80),
  email text check (char_length(email) <= 120),
  phone text check (char_length(phone) <= 20),
  topic text check (topic in ('pedido','empresa','colegio','evento','otro')),
  message text not null check (char_length(message) between 5 and 1500),
  handled boolean not null default false
);

-- ─────────────── Seguridad (RLS) ───────────────
alter table public.shirt_colors enable row level security;
alter table public.designs enable row level security;
alter table public.settings enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_votes enable row level security;
alter table public.idea_comments enable row level security;
alter table public.promotions enable row level security;
alter table public.challenges enable row level security;
alter table public.checkins enable row level security;
alter table public.contact_messages enable row level security;

-- lectura pública del catálogo
create policy "catalogo publico" on public.shirt_colors for select using (active);
create policy "disenos publicos" on public.designs for select using (active);
create policy "ajustes publicos" on public.settings for select using (true);
create policy "promos publicas" on public.promotions for select using (active);
create policy "retos publicos" on public.challenges for select using (active);

-- perfiles
create policy "perfiles visibles" on public.profiles for select using (true);
create policy "editar mi perfil" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- pedidos: cualquiera crea; solo el dueño ve los suyos
create policy "crear pedido" on public.orders for insert to anon, authenticated
  with check (status = 'nuevo' and (user_id is null or user_id = (select auth.uid())));
create policy "ver mis pedidos" on public.orders for select to authenticated
  using (user_id = (select auth.uid()));

-- chat
create policy "leer chat" on public.chat_messages for select using (true);
create policy "escribir chat" on public.chat_messages for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "borrar mi mensaje" on public.chat_messages for delete to authenticated
  using (user_id = (select auth.uid()));

-- ideas
create policy "leer ideas" on public.ideas for select using (true);
create policy "crear idea" on public.ideas for insert to authenticated
  with check (user_id = (select auth.uid()) and votes_count = 0 and comments_count = 0);
create policy "editar mi idea" on public.ideas for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "borrar mi idea" on public.ideas for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "leer votos" on public.idea_votes for select using (true);
create policy "votar" on public.idea_votes for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "quitar voto" on public.idea_votes for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "leer comentarios" on public.idea_comments for select using (true);
create policy "comentar" on public.idea_comments for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "borrar mi comentario" on public.idea_comments for delete to authenticated
  using (user_id = (select auth.uid()));

-- rachas
create policy "ver mis checkins" on public.checkins for select to authenticated
  using (user_id = (select auth.uid()));
create policy "marcar hoy" on public.checkins for insert to authenticated
  with check (user_id = (select auth.uid()) and day = (now() at time zone 'America/El_Salvador')::date);

-- contacto: solo insertar
create policy "enviar contacto" on public.contact_messages for insert to anon, authenticated
  with check (handled = false);

-- ─────────────── Tiempo real ───────────────
alter publication supabase_realtime add table public.chat_messages, public.ideas, public.idea_comments;

-- ─────────────── Datos iniciales (ejemplos, editables) ───────────────
insert into public.shirt_colors (slug, name, hex, sort) values
  ('blanco','Blanco','#F4F4F2',1),
  ('negro','Negro','#1A1A1C',2),
  ('marino','Azul marino','#1E2A4A',3),
  ('rojo','Rojo','#C62A2F',4),
  ('royal','Azul royal','#2450B8',5),
  ('verde','Verde bosque','#1F5A3C',6),
  ('amarillo','Amarillo','#F2C230',7),
  ('gris','Gris jaspe','#9A9CA0',8);

insert into public.designs (slug, name, category, ink_note, sort) values
  ('torogoz','Torogoz','El Salvador','3 tintas',1),
  ('volcan','Volcán','El Salvador','2 tintas',2),
  ('maquilishuat','Maquilishuat','El Salvador','2 tintas',3),
  ('olas','Olas del Pacífico','Playa','2 tintas',4),
  ('cafe','Café de altura','Sabores','2 tintas',5),
  ('pupusa','Pupusa Power','Sabores','3 tintas',6),
  ('tu-logo','Tu logo aquí','Empresas','según tu arte',7),
  ('promo','Promo 2027','Colegios','2 tintas',8);

insert into public.settings (key, value) values
  ('whatsapp', ''),
  ('price_note', 'Te confirmamos precio y tiempo de entrega por WhatsApp.');

insert into public.promotions (title, description, badge, sort) values
  ('Pedido de grupo','Para equipos, familias o excursiones: pregúntanos por el precio especial por volumen.','Grupos',1),
  ('Mes de las promociones','Paquetes para graduaciones y promociones de colegio.','Colegios',2),
  ('Uniformes con tu logo','Tu empresa con camisetas iguales para todo el equipo.','Empresas',3);

insert into public.challenges (slug, title, description, goal_days, prize, sort) values
  ('visita-7','Racha de 7 días','Entra a la comunidad y marca tu día 7 días seguidos.',7,'Premio de ejemplo: sticker Basic&Print',1),
  ('visita-30','Racha de 30 días','30 días seguidos sin romper la racha.',30,'Premio de ejemplo: camiseta con el diseño que elijas',2);

-- Las funciones de trigger no se exponen por la API
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.refresh_idea_counts() from public, anon, authenticated;
