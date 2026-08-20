-- =============================================================================
-- 2 Irmãos Impressões 3D — schema completo do banco (Postgres / Supabase)
--
-- COMO USAR: cole este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (https://supabase.com/dashboard/project/_/sql/new) e clique em "Run".
-- É seguro rodar mais de uma vez (usa IF NOT EXISTS / ON CONFLICT DO NOTHING).
--
-- Depois de rodar, popule dados fictícios com: npm run seed
-- (lê SUPABASE_SERVICE_ROLE_KEY de .env.local — nunca rode esse script no browser)
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'funcionario', 'cliente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_badge as enum ('mais_vendido', 'novo', 'oferta');
exception when duplicate_object then null; end $$;

do $$ begin
  create type field_type as enum ('texto', 'numero', 'data', 'cor', 'upload', 'observacoes');
exception when duplicate_object then null; end $$;

do $$ begin
  create type production_status as enum (
    'recebido', 'pagamento_aprovado', 'preparando_arquivo', 'fila_impressao',
    'imprimindo', 'acabamento', 'controle_qualidade', 'embalando', 'enviado', 'entregue'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type kanban_stage as enum (
    'aguardando', 'arquivo_preparado', 'fila_impressao', 'imprimindo', 'acabamento', 'pronto'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('pix', 'cartao_credito', 'cartao_debito', 'mercado_pago');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('aguardando', 'aprovado', 'recusado', 'estornado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quote_status as enum ('novo', 'em_analise', 'orcamento_enviado', 'aprovado', 'recusado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type coupon_type as enum ('percentual', 'fixo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type printer_status as enum ('disponivel', 'imprimindo', 'manutencao', 'offline');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- TABELAS
-- ---------------------------------------------------------------------------

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text,
  phone text,
  document text,
  role user_role not null default 'cliente',
  created_at timestamptz not null default now()
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  label text not null default 'Casa',
  cep text not null,
  street text not null,
  number text not null,
  complement text,
  district text not null,
  city text not null,
  state text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  icon text not null default 'box',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  sku text unique not null,
  name text not null,
  category_id uuid references categories (id) on delete set null,
  short_description text not null default '',
  description text not null default '',
  material text not null default '',
  weight_grams int not null default 0,
  dimensions text not null default '',
  production_days int not null default 3,
  shipping_days int not null default 5,
  price numeric(10, 2) not null default 0,
  compare_at_price numeric(10, 2),
  installments int not null default 1,
  stock int not null default 0,
  made_to_order boolean not null default false,
  badge product_badge,
  allow_custom_name boolean not null default false,
  rating_avg numeric(2, 1) not null default 0,
  rating_count int not null default 0,
  sold_count int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  seed text not null,
  alt text not null default '',
  sort_order int not null default 0
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  variant_type text not null check (variant_type in ('cor', 'tamanho')),
  name text not null,
  hex text,
  price_delta numeric(10, 2) not null default 0,
  sort_order int not null default 0
);

create table if not exists custom_fields (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  label text not null,
  field_type field_type not null default 'texto',
  required boolean not null default false,
  placeholder text,
  options text[]
);

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles (id) on delete cascade,
  session_id text,
  created_at timestamptz not null default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts (id) on delete cascade,
  product_id uuid not null references products (id),
  unit_price numeric(10, 2) not null,
  quantity int not null default 1,
  customization jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type coupon_type not null default 'percentual',
  value numeric(10, 2) not null default 0,
  min_order_value numeric(10, 2) not null default 0,
  max_uses int not null default 0,
  used_count int not null default 0,
  expires_at date,
  active boolean not null default true
);

create table if not exists printers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  model text not null default '',
  status printer_status not null default 'disponivel',
  current_order_code text
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  profile_id uuid references profiles (id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  subtotal numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  shipping_cost numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  coupon_code text,
  address jsonb not null default '{}'::jsonb,
  shipping_method text not null default '',
  payment_method payment_method not null default 'pix',
  payment_status payment_status not null default 'aguardando',
  status production_status not null default 'recebido',
  kanban_stage kanban_stage not null default 'aguardando',
  priority text not null default 'normal' check (priority in ('normal', 'alta', 'urgente')),
  printer_id uuid references printers (id) on delete set null,
  tracking_code text,
  estimated_date date,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id),
  name text not null,
  image_seed text,
  unit_price numeric(10, 2) not null,
  quantity int not null default 1,
  customization jsonb not null default '{}'::jsonb
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  method payment_method not null,
  status payment_status not null default 'aguardando',
  amount numeric(10, 2) not null,
  pix_code text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists shipping (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  carrier text not null default '',
  service text not null default '',
  cost numeric(10, 2) not null default 0,
  deadline_days int not null default 5,
  tracking_code text
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  profile_id uuid references profiles (id) on delete set null,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  verified_purchase boolean not null default false,
  photo_seed text,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists custom_quotes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles (id) on delete set null,
  name text not null,
  whatsapp text not null,
  email text not null,
  description text not null,
  quantity int not null default 1,
  approx_size text,
  color text,
  material text,
  desired_deadline text,
  status quote_status not null default 'novo',
  estimated_price numeric(10, 2),
  admin_notes text,
  created_at timestamptz not null default now()
);

create table if not exists quote_files (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references custom_quotes (id) on delete cascade,
  name text not null,
  size_kb int not null default 0,
  type text not null default '',
  storage_path text not null
);

create table if not exists production_queue (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders (id) on delete cascade,
  stage kanban_stage not null default 'aguardando',
  printer_id uuid references printers (id) on delete set null,
  priority text not null default 'normal',
  updated_at timestamptz not null default now()
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  brand text not null default '',
  color text not null default '',
  weight_available_g numeric(10, 2) not null default 0,
  cost_per_kg numeric(10, 2) not null default 0,
  batch text,
  low_stock_threshold_g numeric(10, 2) not null default 200
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references materials (id) on delete cascade,
  movement_type text not null check (movement_type in ('entrada', 'saida')),
  quantity_g numeric(10, 2) not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists production_losses (
  id uuid primary key default gen_random_uuid(),
  material_id uuid references materials (id) on delete set null,
  product_id uuid references products (id) on delete set null,
  description text not null,
  quantity_pieces int not null default 1,
  weight_g numeric(10, 2) not null default 0,
  cost numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists financial_expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text not null default 'outros',
  amount numeric(10, 2) not null default 0,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  message text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TRIGGER: cria profile automaticamente ao registrar um novo usuário
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    'cliente'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- HELPER: verifica se o usuário logado é admin/funcionário (para políticas)
-- ---------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'funcionario')
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table custom_fields enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table shipping enable row level security;
alter table reviews enable row level security;
alter table custom_quotes enable row level security;
alter table quote_files enable row level security;
alter table printers enable row level security;
alter table production_queue enable row level security;
alter table materials enable row level security;
alter table inventory enable row level security;
alter table production_losses enable row level security;
alter table financial_expenses enable row level security;
alter table notifications enable row level security;

-- profiles: cada um vê/edita o próprio; staff vê todos
drop policy if exists "profiles_select_own_or_staff" on profiles;
create policy "profiles_select_own_or_staff" on profiles for select
  using (auth.uid() = id or public.is_staff());
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- addresses: dono do endereço, ou staff
drop policy if exists "addresses_owner_or_staff" on addresses;
create policy "addresses_owner_or_staff" on addresses for all
  using (profile_id = auth.uid() or public.is_staff())
  with check (profile_id = auth.uid() or public.is_staff());

-- catálogo público: leitura livre, escrita só staff
drop policy if exists "categories_read_all" on categories;
create policy "categories_read_all" on categories for select using (true);
drop policy if exists "categories_write_staff" on categories;
create policy "categories_write_staff" on categories for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "products_read_all" on products;
create policy "products_read_all" on products for select using (true);
drop policy if exists "products_write_staff" on products;
create policy "products_write_staff" on products for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "product_images_read_all" on product_images;
create policy "product_images_read_all" on product_images for select using (true);
drop policy if exists "product_images_write_staff" on product_images;
create policy "product_images_write_staff" on product_images for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "product_variants_read_all" on product_variants;
create policy "product_variants_read_all" on product_variants for select using (true);
drop policy if exists "product_variants_write_staff" on product_variants;
create policy "product_variants_write_staff" on product_variants for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "custom_fields_read_all" on custom_fields;
create policy "custom_fields_read_all" on custom_fields for select using (true);
drop policy if exists "custom_fields_write_staff" on custom_fields;
create policy "custom_fields_write_staff" on custom_fields for all
  using (public.is_staff()) with check (public.is_staff());

-- carrinho: dono do carrinho
drop policy if exists "carts_owner" on carts;
create policy "carts_owner" on carts for all
  using (profile_id = auth.uid() or public.is_staff())
  with check (profile_id = auth.uid() or public.is_staff());
drop policy if exists "cart_items_owner" on cart_items;
create policy "cart_items_owner" on cart_items for all
  using (exists (select 1 from carts c where c.id = cart_id and (c.profile_id = auth.uid() or public.is_staff())))
  with check (exists (select 1 from carts c where c.id = cart_id and (c.profile_id = auth.uid() or public.is_staff())));

-- cupons: leitura de ativos para todos, gestão só staff
drop policy if exists "coupons_read_active" on coupons;
create policy "coupons_read_active" on coupons for select using (active = true or public.is_staff());
drop policy if exists "coupons_write_staff" on coupons;
create policy "coupons_write_staff" on coupons for all
  using (public.is_staff()) with check (public.is_staff());

-- pedidos: dono ou staff
drop policy if exists "orders_owner_or_staff" on orders;
create policy "orders_owner_or_staff" on orders for select
  using (profile_id = auth.uid() or public.is_staff());
drop policy if exists "orders_insert_own" on orders;
create policy "orders_insert_own" on orders for insert
  with check (profile_id = auth.uid() or profile_id is null or public.is_staff());
drop policy if exists "orders_update_staff" on orders;
create policy "orders_update_staff" on orders for update
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "order_items_owner_or_staff" on order_items;
create policy "order_items_owner_or_staff" on order_items for all
  using (exists (select 1 from orders o where o.id = order_id and (o.profile_id = auth.uid() or public.is_staff())))
  with check (exists (select 1 from orders o where o.id = order_id and (o.profile_id = auth.uid() or public.is_staff())));

drop policy if exists "payments_owner_or_staff" on payments;
create policy "payments_owner_or_staff" on payments for all
  using (exists (select 1 from orders o where o.id = order_id and (o.profile_id = auth.uid() or public.is_staff())))
  with check (public.is_staff());

drop policy if exists "shipping_owner_or_staff" on shipping;
create policy "shipping_owner_or_staff" on shipping for all
  using (exists (select 1 from orders o where o.id = order_id and (o.profile_id = auth.uid() or public.is_staff())))
  with check (public.is_staff());

-- avaliações: leitura pública das aprovadas, insert autenticado, gestão staff
drop policy if exists "reviews_read_approved" on reviews;
create policy "reviews_read_approved" on reviews for select using (approved = true or public.is_staff());
drop policy if exists "reviews_insert_authenticated" on reviews;
create policy "reviews_insert_authenticated" on reviews for insert
  with check (auth.uid() is not null);
drop policy if exists "reviews_write_staff" on reviews;
create policy "reviews_write_staff" on reviews for update using (public.is_staff());
drop policy if exists "reviews_delete_staff" on reviews;
create policy "reviews_delete_staff" on reviews for delete using (public.is_staff());

-- orçamentos personalizados: dono ou staff
drop policy if exists "quotes_owner_or_staff" on custom_quotes;
create policy "quotes_owner_or_staff" on custom_quotes for select
  using (profile_id = auth.uid() or public.is_staff());
drop policy if exists "quotes_insert_any" on custom_quotes;
create policy "quotes_insert_any" on custom_quotes for insert with check (true);
drop policy if exists "quotes_update_staff" on custom_quotes;
create policy "quotes_update_staff" on custom_quotes for update using (public.is_staff());

drop policy if exists "quote_files_owner_or_staff" on quote_files;
create policy "quote_files_owner_or_staff" on quote_files for all
  using (exists (select 1 from custom_quotes q where q.id = quote_id and (q.profile_id = auth.uid() or public.is_staff())))
  with check (true);

-- produção interna: só staff
drop policy if exists "printers_staff" on printers;
create policy "printers_staff" on printers for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists "production_queue_staff" on production_queue;
create policy "production_queue_staff" on production_queue for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists "materials_staff" on materials;
create policy "materials_staff" on materials for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists "inventory_staff" on inventory;
create policy "inventory_staff" on inventory for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists "production_losses_staff" on production_losses;
create policy "production_losses_staff" on production_losses for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists "financial_expenses_staff" on financial_expenses;
create policy "financial_expenses_staff" on financial_expenses for all using (public.is_staff()) with check (public.is_staff());

-- notificações: dono ou staff
drop policy if exists "notifications_owner_or_staff" on notifications;
create policy "notifications_owner_or_staff" on notifications for all
  using (profile_id = auth.uid() or public.is_staff())
  with check (profile_id = auth.uid() or public.is_staff());

-- ---------------------------------------------------------------------------
-- STORAGE: buckets e políticas
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('quote-files', 'quote-files', false)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects for select
  using (bucket_id = 'product-images');
drop policy if exists "product_images_staff_write" on storage.objects;
create policy "product_images_staff_write" on storage.objects for all
  using (bucket_id = 'product-images' and public.is_staff())
  with check (bucket_id = 'product-images' and public.is_staff());

-- quote-files: cada cliente só acessa a própria pasta (primeiro segmento do path = seu uid);
-- staff acessa tudo. O app deve subir arquivos em `${user.id}/${quoteId}/${fileName}`.
drop policy if exists "quote_files_owner_rw" on storage.objects;
create policy "quote_files_owner_rw" on storage.objects for all
  using (
    bucket_id = 'quote-files' and
    (public.is_staff() or (storage.foldername(name))[1] = auth.uid()::text)
  )
  with check (
    bucket_id = 'quote-files' and
    (public.is_staff() or (storage.foldername(name))[1] = auth.uid()::text)
  );

-- =============================================================================
-- Fim do schema. Próximo passo: rode `npm run seed` para popular dados fictícios.
-- =============================================================================
