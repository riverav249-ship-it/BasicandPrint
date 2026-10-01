-- Precios (editables en el panel → Ajustes)
insert into public.settings (key, value) values
  ('price_basic', '8'),
  ('price_basic_pack', '6'),
  ('price_print', '12'),
  ('price_print_pack', '10'),
  ('price_pack_min', '10'),
  ('price_note', 'Envío a todo El Salvador en pedidos de 10 camisetas o más. Te confirmamos fecha de entrega por WhatsApp.')
on conflict (key) do update set value = excluded.value;

-- El pedido guarda el precio que vio el cliente (referencia; el negocio confirma por WhatsApp)
alter table public.orders add column if not exists subtotal numeric(10,2) check (subtotal is null or subtotal >= 0);
alter table public.order_items add column if not exists unit_price numeric(8,2) check (unit_price is null or unit_price >= 0);
alter table public.order_items add column if not exists printed boolean not null default true;
alter table public.order_items add column if not exists custom_text text check (custom_text is null or char_length(custom_text) <= 60);
