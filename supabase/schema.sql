-- ============================================================================
-- MlleLAbeille — Supabase schema
-- Execute FIRST (order: schema.sql → rls.sql → storage.sql → seed.sql).
-- See supabase/README.md for the full walkthrough.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  preferred_locale text not null default 'fr' check (preferred_locale in ('fr', 'en')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Catalogue: collections, celebrations, illustrations
-- Localized copy is stored as jsonb: {"fr": "...", "en": "..."}.
-- ---------------------------------------------------------------------------
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,                      -- brand name, stays French
  subtitle jsonb not null default '{}',
  description jsonb not null default '{}',
  accent_color text,
  tint_color text,
  cover_illustration_slug text,
  sort_order int not null default 0,
  seo_title jsonb not null default '{}',
  seo_description jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger collections_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

create table if not exists public.celebration_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name jsonb not null default '{}',
  description jsonb not null default '{}',
  icon text,
  tint_color text,
  sort_order int not null default 0,
  seo_title jsonb not null default '{}',
  seo_description jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger celebration_categories_updated_at
  before update on public.celebration_categories
  for each row execute function public.set_updated_at();

create table if not exists public.personalization_templates (
  id text primary key,                     -- 'naissance', 'anniversaire', 'douceur'
  name jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger personalization_templates_updated_at
  before update on public.personalization_templates
  for each row execute function public.set_updated_at();

create table if not exists public.personalization_fields (
  id uuid primary key default gen_random_uuid(),
  template_id text not null references public.personalization_templates (id) on delete cascade,
  key text not null,
  field_type text not null check (field_type in ('text','textarea','date','time','select','number')),
  label jsonb not null default '{}',
  placeholder jsonb,
  required boolean not null default false,
  max_length int,
  min_value numeric,
  max_value numeric,
  options jsonb,                            -- [{value, label:{fr,en}}]
  show_in_preview boolean not null default false,
  sort_order int not null default 0,
  unique (template_id, key)
);

create table if not exists public.illustrations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title jsonb not null default '{}',
  description jsonb not null default '{}',
  alt_text jsonb not null default '{}',
  background_color text,
  image_path text,                          -- storage path or /public path
  image_width int not null default 2048,
  image_height int not null default 2048,
  is_placeholder boolean not null default false,
  tags jsonb not null default '[]',         -- [{fr, en}]
  status text not null default 'draft' check (status in ('draft','published')),
  featured boolean not null default false,
  featured_order int,
  personalization_template_id text references public.personalization_templates (id) on delete set null,
  seo_title jsonb not null default '{}',
  seo_description jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists illustrations_status_idx on public.illustrations (status);
create index if not exists illustrations_featured_idx on public.illustrations (featured, featured_order);
create trigger illustrations_updated_at
  before update on public.illustrations
  for each row execute function public.set_updated_at();

create table if not exists public.illustration_images (
  id uuid primary key default gen_random_uuid(),
  illustration_id uuid not null references public.illustrations (id) on delete cascade,
  kind text not null default 'gallery' check (kind in ('primary','gallery','mockup')),
  storage_path text not null,
  alt_text jsonb not null default '{}',
  width int,
  height int,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists illustration_images_ill_idx on public.illustration_images (illustration_id);

create table if not exists public.collection_illustrations (
  collection_id uuid not null references public.collections (id) on delete cascade,
  illustration_id uuid not null references public.illustrations (id) on delete cascade,
  sort_order int not null default 0,
  primary key (collection_id, illustration_id)
);

create table if not exists public.celebration_illustrations (
  celebration_id uuid not null references public.celebration_categories (id) on delete cascade,
  illustration_id uuid not null references public.illustrations (id) on delete cascade,
  sort_order int not null default 0,
  primary key (celebration_id, illustration_id)
);

-- ---------------------------------------------------------------------------
-- Products (physical supports) & variants
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name jsonb not null default '{}',
  description jsonb not null default '{}',
  personalizable boolean not null default false,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table if not exists public.product_variants (
  id text primary key,                      -- 'mug-325', 'affiche-a3'…
  product_id uuid not null references public.products (id) on delete cascade,
  name jsonb not null default '{}',
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'EUR' check (char_length(currency) = 3),
  available boolean not null default true,
  inventory int,                            -- null = made to order
  printify_blueprint_id int,
  printify_print_provider_id int,
  printify_variant_id int,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists product_variants_product_idx on public.product_variants (product_id);
create trigger product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create table if not exists public.illustration_products (
  illustration_id uuid not null references public.illustrations (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  primary key (illustration_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Customer data: favorites, addresses, carts
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  illustration_id uuid not null references public.illustrations (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, illustration_id)
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text check (char_length(label) <= 40),
  first_name text not null,
  last_name text not null,
  address1 text not null,
  address2 text,
  postal_code text not null,
  city text not null,
  country text not null check (char_length(country) = 2),
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses (user_id);
create trigger addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  status text not null default 'active' check (status in ('active','converted','abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
create trigger carts_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  illustration_id uuid not null references public.illustrations (id) on delete cascade,
  variant_id text not null references public.product_variants (id) on delete cascade,
  quantity int not null default 1 check (quantity between 1 and 99),
  personalization jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, illustration_id, variant_id, personalization)
);
create index if not exists cart_items_cart_idx on public.cart_items (cart_id);
create trigger cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Orders
-- Denormalized snapshots (titles, prices) so history survives catalogue edits.
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,                 -- human reference MLB-XXXXXXXX
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  locale text not null default 'fr',
  status text not null default 'pending'
    check (status in ('draft','pending','paid','processing','shipped','delivered','cancelled','refunded')),
  currency text not null default 'EUR' check (char_length(currency) = 3),
  subtotal_cents int not null check (subtotal_cents >= 0),
  shipping_cents int not null default 0 check (shipping_cents >= 0),
  total_cents int not null check (total_cents >= 0),
  payment_provider text check (payment_provider in ('stripe','mock')),
  payment_reference text,                   -- Stripe session id
  fulfillment_provider text check (fulfillment_provider in ('printify','manual')),
  fulfillment_reference text,               -- Printify order id
  shipping_first_name text not null,
  shipping_last_name text not null,
  shipping_address1 text not null,
  shipping_address2 text,
  shipping_postal_code text not null,
  shipping_city text not null,
  shipping_country text not null check (char_length(shipping_country) = 2),
  shipping_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  illustration_slug text not null,
  illustration_title text not null,
  product_slug text not null,
  product_name text not null,
  variant_id text not null,
  quantity int not null check (quantity between 1 and 99),
  unit_price_cents int not null check (unit_price_cents >= 0),
  personalization jsonb,
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Newsletter & contact
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'fr',
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 80),
  email text not null,
  message text not null check (char_length(message) <= 4000),
  locale text not null default 'fr',
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper: is the current user an admin? (used by RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;
