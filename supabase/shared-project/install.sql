-- Mademoiselle l'Abeille — installation dans un projet Supabase partagé
-- Source : joachimvc42/MlleLAbeille, branche main, consultée le 2026-09-07.
-- Exécuter EN ENTIER dans SQL Editor avec le rôle postgres.
-- Installation initiale uniquement : arrêt si mlle_labeille existe déjà.
-- Transaction atomique : toute erreur annule cette installation.
-- Aucun objet public.* ni déclencheur existant n'est remplacé.
-- Auth est commun : un profil Abeille vide est créé pour chaque NOUVEL inscrit.
-- Les comptes déjà présents ne sont pas copiés (voir INSTALLATION.md).
-- Les fichiers images et les données de production ne sont pas transférés.
-- Après exécution : exposer mlle_labeille dans Data API et adapter les clients du site.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';
create schema mlle_labeille;
create schema mlle_labeille_private;
revoke all on schema mlle_labeille_private from public;
revoke all on schema mlle_labeille from public;
do $preflight$
begin
  if exists (select 1 from pg_trigger where tgrelid = 'auth.users'::regclass
             and tgname = 'mlle_labeille_on_auth_user_created') then
    raise exception 'Le déclencheur mlle_labeille existe déjà. Installation annulée.';
  end if;
  if exists (select 1 from storage.buckets where id in ('mlle-labeille-illustrations-originals', 'mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups', 'mlle-labeille-personalization-uploads')) then
    raise exception 'Un bucket mlle-labeille existe déjà. Installation annulée.';
  end if;
end;
$preflight$;

-- ============================================================================
-- MlleLAbeille — Supabase schema
-- Execute FIRST (order: schema.sql → rls.sql → storage.sql → seed.sql).
-- See supabase/README.md for the full walkthrough.
-- ============================================================================

-- gen_random_uuid() est intégré aux versions PostgreSQL de Supabase.

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function mlle_labeille.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists mlle_labeille.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  preferred_locale text not null default 'fr' check (preferred_locale in ('fr', 'en')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on mlle_labeille.profiles
  for each row execute function mlle_labeille.set_updated_at();

-- Auto-create a profile when a user signs up.
create or replace function mlle_labeille_private.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into mlle_labeille.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger mlle_labeille_on_auth_user_created
  after insert on auth.users
  for each row execute function mlle_labeille_private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Catalogue: collections, celebrations, illustrations
-- Localized copy is stored as jsonb: {"fr": "...", "en": "..."}.
-- ---------------------------------------------------------------------------
create table if not exists mlle_labeille.collections (
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
  before update on mlle_labeille.collections
  for each row execute function mlle_labeille.set_updated_at();

create table if not exists mlle_labeille.celebration_categories (
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
  before update on mlle_labeille.celebration_categories
  for each row execute function mlle_labeille.set_updated_at();

create table if not exists mlle_labeille.personalization_templates (
  id text primary key,                     -- 'naissance', 'anniversaire', 'douceur'
  name jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger personalization_templates_updated_at
  before update on mlle_labeille.personalization_templates
  for each row execute function mlle_labeille.set_updated_at();

create table if not exists mlle_labeille.personalization_fields (
  id uuid primary key default gen_random_uuid(),
  template_id text not null references mlle_labeille.personalization_templates (id) on delete cascade,
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

create table if not exists mlle_labeille.illustrations (
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
  personalization_template_id text references mlle_labeille.personalization_templates (id) on delete set null,
  seo_title jsonb not null default '{}',
  seo_description jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists illustrations_status_idx on mlle_labeille.illustrations (status);
create index if not exists illustrations_featured_idx on mlle_labeille.illustrations (featured, featured_order);
create trigger illustrations_updated_at
  before update on mlle_labeille.illustrations
  for each row execute function mlle_labeille.set_updated_at();

create table if not exists mlle_labeille.illustration_images (
  id uuid primary key default gen_random_uuid(),
  illustration_id uuid not null references mlle_labeille.illustrations (id) on delete cascade,
  kind text not null default 'gallery' check (kind in ('primary','gallery','mockup')),
  storage_path text not null,
  alt_text jsonb not null default '{}',
  width int,
  height int,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists illustration_images_ill_idx on mlle_labeille.illustration_images (illustration_id);

create table if not exists mlle_labeille.collection_illustrations (
  collection_id uuid not null references mlle_labeille.collections (id) on delete cascade,
  illustration_id uuid not null references mlle_labeille.illustrations (id) on delete cascade,
  sort_order int not null default 0,
  primary key (collection_id, illustration_id)
);

create table if not exists mlle_labeille.celebration_illustrations (
  celebration_id uuid not null references mlle_labeille.celebration_categories (id) on delete cascade,
  illustration_id uuid not null references mlle_labeille.illustrations (id) on delete cascade,
  sort_order int not null default 0,
  primary key (celebration_id, illustration_id)
);

-- ---------------------------------------------------------------------------
-- Products (physical supports) & variants
-- ---------------------------------------------------------------------------
create table if not exists mlle_labeille.products (
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
  before update on mlle_labeille.products
  for each row execute function mlle_labeille.set_updated_at();

create table if not exists mlle_labeille.product_variants (
  id text primary key,                      -- 'mug-325', 'affiche-a3'…
  product_id uuid not null references mlle_labeille.products (id) on delete cascade,
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
create index if not exists product_variants_product_idx on mlle_labeille.product_variants (product_id);
create trigger product_variants_updated_at
  before update on mlle_labeille.product_variants
  for each row execute function mlle_labeille.set_updated_at();

create table if not exists mlle_labeille.illustration_products (
  illustration_id uuid not null references mlle_labeille.illustrations (id) on delete cascade,
  product_id uuid not null references mlle_labeille.products (id) on delete cascade,
  primary key (illustration_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Customer data: favorites, addresses, carts
-- ---------------------------------------------------------------------------
create table if not exists mlle_labeille.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  illustration_id uuid not null references mlle_labeille.illustrations (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, illustration_id)
);

create table if not exists mlle_labeille.addresses (
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
create index if not exists addresses_user_idx on mlle_labeille.addresses (user_id);
create trigger addresses_updated_at
  before update on mlle_labeille.addresses
  for each row execute function mlle_labeille.set_updated_at();

create table if not exists mlle_labeille.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  status text not null default 'active' check (status in ('active','converted','abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
create trigger carts_updated_at
  before update on mlle_labeille.carts
  for each row execute function mlle_labeille.set_updated_at();

create table if not exists mlle_labeille.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references mlle_labeille.carts (id) on delete cascade,
  illustration_id uuid not null references mlle_labeille.illustrations (id) on delete cascade,
  variant_id text not null references mlle_labeille.product_variants (id) on delete cascade,
  quantity int not null default 1 check (quantity between 1 and 99),
  personalization jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, illustration_id, variant_id, personalization)
);
create index if not exists cart_items_cart_idx on mlle_labeille.cart_items (cart_id);
create trigger cart_items_updated_at
  before update on mlle_labeille.cart_items
  for each row execute function mlle_labeille.set_updated_at();

-- ---------------------------------------------------------------------------
-- Orders
-- Denormalized snapshots (titles, prices) so history survives catalogue edits.
-- ---------------------------------------------------------------------------
create table if not exists mlle_labeille.orders (
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
  payment_provider text check (payment_provider in ('stripe','xendit','mock')),
  payment_reference text,                   -- Stripe session id / Xendit invoice id
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
create index if not exists orders_user_idx on mlle_labeille.orders (user_id);
create index if not exists orders_status_idx on mlle_labeille.orders (status);
create trigger orders_updated_at
  before update on mlle_labeille.orders
  for each row execute function mlle_labeille.set_updated_at();

-- Widen payment_provider to allow 'xendit' on databases created before it
-- existed (re-running this script is always safe).
alter table mlle_labeille.orders drop constraint if exists orders_payment_provider_check;
alter table mlle_labeille.orders add constraint orders_payment_provider_check
  check (payment_provider in ('stripe','xendit','mock'));

create table if not exists mlle_labeille.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references mlle_labeille.orders (id) on delete cascade,
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
create index if not exists order_items_order_idx on mlle_labeille.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Newsletter & contact
-- ---------------------------------------------------------------------------
create table if not exists mlle_labeille.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'fr',
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists mlle_labeille.contact_messages (
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
create or replace function mlle_labeille_private.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select coalesce(
    (select is_admin from mlle_labeille.profiles where id = (select auth.uid())),
    false
  );
$$;

-- ============================================================================
-- MlleLAbeille — Row Level Security
-- Execute SECOND (after schema.sql).
--
-- Principles:
--   • the public reads only published catalogue content;
--   • customers see and manage ONLY their own data;
--   • order totals and paid statuses can never be altered by customers;
--   • newsletter/contact accept public INSERTs, nothing else;
--   • everything administrative goes through is_admin() or the
--     service-role key (server-side only).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
alter table mlle_labeille.profiles enable row level security;

create policy "profiles: read own"
  on mlle_labeille.profiles for select
  using ((select auth.uid()) = id or mlle_labeille_private.is_admin());

create policy "profiles: insert own"
  on mlle_labeille.profiles for insert
  with check ((select auth.uid()) = id and is_admin = false);

create policy "profiles: update own"
  on mlle_labeille.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
  -- is_admin est protégé par les privilèges de colonnes accordés plus bas.

-- ---------------------------------------------------------------------------
-- Public catalogue: readable by everyone when published, writable by admins
-- ---------------------------------------------------------------------------
alter table mlle_labeille.collections enable row level security;
create policy "collections: public read"
  on mlle_labeille.collections for select using (true);
create policy "collections: admin write"
  on mlle_labeille.collections for all
  using (mlle_labeille_private.is_admin()) with check (mlle_labeille_private.is_admin());

alter table mlle_labeille.celebration_categories enable row level security;
create policy "celebrations: public read"
  on mlle_labeille.celebration_categories for select using (true);
create policy "celebrations: admin write"
  on mlle_labeille.celebration_categories for all
  using (mlle_labeille_private.is_admin()) with check (mlle_labeille_private.is_admin());

alter table mlle_labeille.personalization_templates enable row level security;
create policy "perso templates: public read"
  on mlle_labeille.personalization_templates for select using (true);
create policy "perso templates: admin write"
  on mlle_labeille.personalization_templates for all
  using (mlle_labeille_private.is_admin()) with check (mlle_labeille_private.is_admin());

alter table mlle_labeille.personalization_fields enable row level security;
create policy "perso fields: public read"
  on mlle_labeille.personalization_fields for select using (true);
create policy "perso fields: admin write"
  on mlle_labeille.personalization_fields for all
  using (mlle_labeille_private.is_admin()) with check (mlle_labeille_private.is_admin());

alter table mlle_labeille.illustrations enable row level security;
create policy "illustrations: public read published"
  on mlle_labeille.illustrations for select
  using (status = 'published' or mlle_labeille_private.is_admin());
create policy "illustrations: admin write"
  on mlle_labeille.illustrations for all
  using (mlle_labeille_private.is_admin()) with check (mlle_labeille_private.is_admin());

alter table mlle_labeille.illustration_images enable row level security;
create policy "illustration images: public read"
  on mlle_labeille.illustration_images for select
  using (
    exists (
      select 1 from mlle_labeille.illustrations i
      where i.id = illustration_id
        and (i.status = 'published' or mlle_labeille_private.is_admin())
    )
  );
create policy "illustration images: admin write"
  on mlle_labeille.illustration_images for all
  using (mlle_labeille_private.is_admin()) with check (mlle_labeille_private.is_admin());

alter table mlle_labeille.collection_illustrations enable row level security;
create policy "collection links: public read"
  on mlle_labeille.collection_illustrations for select using (true);
create policy "collection links: admin write"
  on mlle_labeille.collection_illustrations for all
  using (mlle_labeille_private.is_admin()) with check (mlle_labeille_private.is_admin());

alter table mlle_labeille.celebration_illustrations enable row level security;
create policy "celebration links: public read"
  on mlle_labeille.celebration_illustrations for select using (true);
create policy "celebration links: admin write"
  on mlle_labeille.celebration_illustrations for all
  using (mlle_labeille_private.is_admin()) with check (mlle_labeille_private.is_admin());

alter table mlle_labeille.products enable row level security;
create policy "products: public read active"
  on mlle_labeille.products for select
  using (active or mlle_labeille_private.is_admin());
create policy "products: admin write"
  on mlle_labeille.products for all
  using (mlle_labeille_private.is_admin()) with check (mlle_labeille_private.is_admin());

alter table mlle_labeille.product_variants enable row level security;
create policy "variants: public read"
  on mlle_labeille.product_variants for select using (true);
create policy "variants: admin write"
  on mlle_labeille.product_variants for all
  using (mlle_labeille_private.is_admin()) with check (mlle_labeille_private.is_admin());

alter table mlle_labeille.illustration_products enable row level security;
create policy "illustration products: public read"
  on mlle_labeille.illustration_products for select using (true);
create policy "illustration products: admin write"
  on mlle_labeille.illustration_products for all
  using (mlle_labeille_private.is_admin()) with check (mlle_labeille_private.is_admin());

-- ---------------------------------------------------------------------------
-- Favorites: strictly personal
-- ---------------------------------------------------------------------------
alter table mlle_labeille.favorites enable row level security;
create policy "favorites: own read"
  on mlle_labeille.favorites for select using ((select auth.uid()) = user_id);
create policy "favorites: own insert"
  on mlle_labeille.favorites for insert with check ((select auth.uid()) = user_id);
create policy "favorites: own delete"
  on mlle_labeille.favorites for delete using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Addresses: strictly personal
-- ---------------------------------------------------------------------------
alter table mlle_labeille.addresses enable row level security;
create policy "addresses: own all"
  on mlle_labeille.addresses for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Carts: strictly personal
-- ---------------------------------------------------------------------------
alter table mlle_labeille.carts enable row level security;
create policy "carts: own all"
  on mlle_labeille.carts for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter table mlle_labeille.cart_items enable row level security;
create policy "cart items: own all"
  on mlle_labeille.cart_items for all
  using (
    exists (select 1 from mlle_labeille.carts c where c.id = cart_id and c.user_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from mlle_labeille.carts c where c.id = cart_id and c.user_id = (select auth.uid()))
  );

-- ---------------------------------------------------------------------------
-- Orders: customers READ their own orders. No INSERT/UPDATE/DELETE policies
-- for customers — orders are created and updated exclusively by the server
-- (service-role key), so totals and paid statuses can never be tampered with.
-- ---------------------------------------------------------------------------
alter table mlle_labeille.orders enable row level security;
create policy "orders: own read"
  on mlle_labeille.orders for select
  using ((select auth.uid()) = user_id or mlle_labeille_private.is_admin());

-- Admins can move orders through their lifecycle from the back office.
-- Customers still have no write policy at all.
create policy "orders: admin update"
  on mlle_labeille.orders for update
  using (mlle_labeille_private.is_admin())
  with check (mlle_labeille_private.is_admin());

alter table mlle_labeille.order_items enable row level security;
create policy "order items: own read"
  on mlle_labeille.order_items for select
  using (
    exists (
      select 1 from mlle_labeille.orders o
      where o.id = order_id
        and (o.user_id = (select auth.uid()) or mlle_labeille_private.is_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- Newsletter & contact: public can only INSERT; reading is admin-only.
-- (The storefront inserts via the service role, but these policies also
-- allow direct anonymous inserts, e.g. from edge functions.)
-- ---------------------------------------------------------------------------
alter table mlle_labeille.newsletter_subscribers enable row level security;
create policy "newsletter: public insert"
  on mlle_labeille.newsletter_subscribers for insert with check (true);
create policy "newsletter: admin read"
  on mlle_labeille.newsletter_subscribers for select using (mlle_labeille_private.is_admin());
create policy "newsletter: admin delete"
  on mlle_labeille.newsletter_subscribers for delete using (mlle_labeille_private.is_admin());

alter table mlle_labeille.contact_messages enable row level security;
create policy "contact: public insert"
  on mlle_labeille.contact_messages for insert with check (true);
create policy "contact: admin read"
  on mlle_labeille.contact_messages for select using (mlle_labeille_private.is_admin());
create policy "contact: admin update"
  on mlle_labeille.contact_messages for update
  using (mlle_labeille_private.is_admin()) with check (mlle_labeille_private.is_admin());

-- ============================================================================
-- MlleLAbeille — Storage buckets & policies
-- Execute THIRD (after rls.sql).
--
-- Buckets:
--   mlle-labeille-illustrations-originals  private  master artwork (PNG, ≤ 25 MB)
--   mlle-labeille-illustrations-web        public   optimized WebP/AVIF derivatives
--   mlle-labeille-product-mockups          public   product photos / mockups
--   mlle-labeille-personalization-uploads  private  future customer uploads (≤ 5 MB)
--
-- Path conventions:
--   mlle-labeille-illustrations-originals/<slug>/original.png
--   mlle-labeille-illustrations-web/<slug>/{full,card,thumb}.webp
--   mlle-labeille-product-mockups/<product-slug>/<n>.webp
--   mlle-labeille-personalization-uploads/<user_id>/<order-ref>/<file>
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('mlle-labeille-illustrations-originals', 'mlle-labeille-illustrations-originals', false, 26214400,
   array['image/png','image/jpeg','image/webp']),
  ('mlle-labeille-illustrations-web', 'mlle-labeille-illustrations-web', true, 5242880,
   array['image/webp','image/avif','image/png','image/jpeg']),
  ('mlle-labeille-product-mockups', 'mlle-labeille-product-mockups', true, 5242880,
   array['image/webp','image/avif','image/png','image/jpeg']),
  ('mlle-labeille-personalization-uploads', 'mlle-labeille-personalization-uploads', false, 5242880,
   array['image/png','image/jpeg','image/webp','application/pdf'])
on conflict (id) do nothing;

-- Public buckets: anyone can read.
create policy "mlle_labeille: web images: public read"
  on storage.objects for select
  using (bucket_id in ('mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups'));

-- Admin-managed content.
create policy "mlle_labeille: web images: admin write"
  on storage.objects for insert
  with check (
    bucket_id in ('mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups', 'mlle-labeille-illustrations-originals')
    and mlle_labeille_private.is_admin()
  );

create policy "mlle_labeille: web images: admin update"
  on storage.objects for update
  using (
    bucket_id in ('mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups', 'mlle-labeille-illustrations-originals')
    and mlle_labeille_private.is_admin()
  );

create policy "mlle_labeille: web images: admin delete"
  on storage.objects for delete
  using (
    bucket_id in ('mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups', 'mlle-labeille-illustrations-originals')
    and mlle_labeille_private.is_admin()
  );

-- Originals: admin read only (service role bypasses RLS anyway).
create policy "mlle_labeille: originals: admin read"
  on storage.objects for select
  using (bucket_id = 'mlle-labeille-illustrations-originals' and mlle_labeille_private.is_admin());

-- Personalization uploads: each customer under their own folder.
create policy "mlle_labeille: perso uploads: own read"
  on storage.objects for select
  using (
    bucket_id = 'mlle-labeille-personalization-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "mlle_labeille: perso uploads: own insert"
  on storage.objects for insert
  with check (
    bucket_id = 'mlle-labeille-personalization-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "mlle_labeille: perso uploads: own delete"
  on storage.objects for delete
  using (
    bucket_id = 'mlle-labeille-personalization-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );


-- Garde-fous : les policies permissives de l’autre application ne doivent
-- pas ouvrir les nouveaux buckets. Les autres buckets ne sont pas restreints.
create policy "mlle_labeille: isolation select" on storage.objects
as restrictive for select to anon, authenticated
using ((bucket_id is null or bucket_id not in ('mlle-labeille-illustrations-originals', 'mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups', 'mlle-labeille-personalization-uploads') or (bucket_id in ('mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups') or (bucket_id = 'mlle-labeille-illustrations-originals' and mlle_labeille_private.is_admin()) or (bucket_id = 'mlle-labeille-personalization-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text))));
create policy "mlle_labeille: isolation insert" on storage.objects
as restrictive for insert to anon, authenticated
with check ((bucket_id is null or bucket_id not in ('mlle-labeille-illustrations-originals', 'mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups', 'mlle-labeille-personalization-uploads') or ((bucket_id in ('mlle-labeille-illustrations-originals', 'mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups') and mlle_labeille_private.is_admin()) or (bucket_id = 'mlle-labeille-personalization-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text))));
create policy "mlle_labeille: isolation update" on storage.objects
as restrictive for update to anon, authenticated
using ((bucket_id is null or bucket_id not in ('mlle-labeille-illustrations-originals', 'mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups', 'mlle-labeille-personalization-uploads') or ((bucket_id in ('mlle-labeille-illustrations-originals', 'mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups') and mlle_labeille_private.is_admin()) or (bucket_id = 'mlle-labeille-personalization-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text)))) with check ((bucket_id is null or bucket_id not in ('mlle-labeille-illustrations-originals', 'mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups', 'mlle-labeille-personalization-uploads') or ((bucket_id in ('mlle-labeille-illustrations-originals', 'mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups') and mlle_labeille_private.is_admin()) or (bucket_id = 'mlle-labeille-personalization-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text))));
create policy "mlle_labeille: isolation delete" on storage.objects
as restrictive for delete to anon, authenticated
using ((bucket_id is null or bucket_id not in ('mlle-labeille-illustrations-originals', 'mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups', 'mlle-labeille-personalization-uploads') or ((bucket_id in ('mlle-labeille-illustrations-originals', 'mlle-labeille-illustrations-web', 'mlle-labeille-product-mockups') and mlle_labeille_private.is_admin()) or (bucket_id = 'mlle-labeille-personalization-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text))));

-- ============================================================================
-- MlleLAbeille — Seed data
-- Execute FOURTH (after storage.sql). Idempotent (on conflict do nothing /
-- update). Mirrors src/lib/catalogue/data.ts, the storefront's dev fallback.
-- Dollar-quoting ($m$…$m$) is used so French apostrophes stay untouched.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Personalization templates & fields
-- ---------------------------------------------------------------------------
insert into mlle_labeille.personalization_templates (id, name) values
  ('naissance',    $m${"fr":"Naissance","en":"Birth"}$m$),
  ('anniversaire', $m${"fr":"Anniversaire","en":"Birthday"}$m$),
  ('douceur',      $m${"fr":"Petit mot doux","en":"Sweet note"}$m$)
on conflict (id) do nothing;

insert into mlle_labeille.personalization_fields
  (template_id, key, field_type, label, placeholder, required, max_length, min_value, max_value, options, show_in_preview, sort_order)
values
  ('naissance','babyName','text',$m${"fr":"Prénom du bébé","en":"Baby’s name"}$m$,$m${"fr":"Inès","en":"Ines"}$m$,true,20,null,null,null,true,1),
  ('naissance','birthDate','date',$m${"fr":"Date de naissance","en":"Date of birth"}$m$,null,false,null,null,null,null,true,2),
  ('naissance','birthTime','time',$m${"fr":"Heure","en":"Time"}$m$,null,false,null,null,null,null,false,3),
  ('naissance','weight','text',$m${"fr":"Poids","en":"Weight"}$m$,$m${"fr":"3,250 kg","en":"3.25 kg"}$m$,false,12,null,null,null,false,4),
  ('naissance','height','text',$m${"fr":"Taille","en":"Height"}$m$,$m${"fr":"49 cm","en":"49 cm"}$m$,false,12,null,null,null,false,5),
  ('naissance','presetMessage','select',$m${"fr":"Un petit mot tout prêt","en":"A ready-made note"}$m$,null,false,null,null,null,
    $m$[
      {"value":"bienvenue-petit-tresor","label":{"fr":"Bienvenue petit trésor","en":"Welcome little one"}},
      {"value":"bienvenue-petite-fille","label":{"fr":"Bienvenue petite fille","en":"Welcome baby girl"}},
      {"value":"bienvenue-petit-garcon","label":{"fr":"Bienvenue petit garçon","en":"Welcome baby boy"}},
      {"value":"bienvenue-petit-ange","label":{"fr":"Bienvenue petit ange","en":"Welcome sweet angel"}},
      {"value":"bienvenue-dans-la-famille","label":{"fr":"Bienvenue dans la famille","en":"Welcome to the family"}},
      {"value":"bonjour-petit-soleil","label":{"fr":"Bonjour petit soleil","en":"Hello little sunshine"}}
    ]$m$,true,6),
  ('naissance','customMessage','textarea',$m${"fr":"Ou votre propre message","en":"Or your own message"}$m$,null,false,120,null,null,null,false,7),

  ('anniversaire','name','text',$m${"fr":"Prénom","en":"Name"}$m$,$m${"fr":"Léa","en":"Lea"}$m$,true,20,null,null,null,true,1),
  ('anniversaire','age','number',$m${"fr":"Âge","en":"Age"}$m$,null,false,null,1,120,null,true,2),
  ('anniversaire','message','textarea',$m${"fr":"Votre message d’anniversaire","en":"Your birthday message"}$m$,$m${"fr":"Joyeux anniversaire, petite abeille !","en":"Happy birthday, little bee!"}$m$,false,120,null,null,null,true,3),

  ('douceur','firstName','text',$m${"fr":"Prénom","en":"First name"}$m$,$m${"fr":"Inès","en":"Ines"}$m$,true,20,null,null,null,true,1),
  ('douceur','presetMessage','select',$m${"fr":"Un petit mot tout prêt","en":"A ready-made note"}$m$,null,false,null,null,null,
    $m$[
      {"value":"merci","label":{"fr":"Merci","en":"Thank you"}},
      {"value":"pense-a-toi","label":{"fr":"Je pense à toi","en":"Thinking of you"}},
      {"value":"plein-de-douceur","label":{"fr":"Plein de douceur","en":"A hug in a bee"}},
      {"value":"tu-es-mon-soleil","label":{"fr":"Tu es mon soleil","en":"You are my sunshine"}}
    ]$m$,true,2),
  ('douceur','message','textarea',$m${"fr":"Ou votre propre message","en":"Or your own message"}$m$,null,false,80,null,null,null,true,3),
  ('douceur','date','date',$m${"fr":"Une date à retenir","en":"A date to remember"}$m$,null,false,null,null,null,null,false,4)
on conflict (template_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- Products & variants
-- ---------------------------------------------------------------------------
insert into mlle_labeille.products (slug, name, description, personalizable, sort_order) values
  ('mug',      $m${"fr":"Mug en céramique","en":"Ceramic mug"}$m$,      $m${"fr":"Un mug tout doux pour les matins câlins, imprimé des deux côtés.","en":"A soft-hearted mug for cosy mornings, printed on both sides."}$m$, true, 1),
  ('affiche',  $m${"fr":"Affiche d’art","en":"Art print"}$m$,           $m${"fr":"Papier mat épais 200 g, couleurs douces et fidèles.","en":"Thick 200 gsm matte paper, soft and faithful colours."}$m$, true, 2),
  ('carte',    $m${"fr":"Carte double & enveloppe","en":"Greeting card & envelope"}$m$, $m${"fr":"Une carte à écrire, à offrir, à garder longtemps.","en":"A card to write, to give, to keep for a long time."}$m$, true, 3),
  ('stickers', $m${"fr":"Planche de stickers","en":"Sticker sheet"}$m$, $m${"fr":"Des petites abeilles à coller partout où il manque de la douceur.","en":"Little bees to stick wherever softness is missing."}$m$, false, 4),
  ('tote',     $m${"fr":"Tote bag en coton bio","en":"Organic cotton tote bag"}$m$, $m${"fr":"Pour emporter un peu de son petit monde partout avec soi.","en":"To carry a piece of her little world everywhere."}$m$, false, 5),
  ('carnet',   $m${"fr":"Carnet ligné","en":"Lined notebook"}$m$,       $m${"fr":"128 pages pour les listes, les rêves et les petits riens.","en":"128 pages for lists, dreams and lovely little nothings."}$m$, true, 6),
  ('body',     $m${"fr":"Body bébé en coton bio","en":"Organic cotton baby bodysuit"}$m$, $m${"fr":"Tout doux pour la peau des tout-petits, certifié coton biologique.","en":"Extra soft on tiny skin, certified organic cotton."}$m$, true, 7),
  ('coussin',  $m${"fr":"Coussin douillet","en":"Cosy cushion"}$m$,     $m${"fr":"Le coussin sur lequel Mademoiselle l’Abeille aime se reposer.","en":"The very cushion Mademoiselle l’Abeille likes to rest on."}$m$, false, 8)
on conflict (slug) do nothing;

insert into mlle_labeille.product_variants (id, product_id, name, price_cents, sort_order) values
  ('mug-325',      (select id from mlle_labeille.products where slug='mug'),      $m${"fr":"325 ml","en":"11 oz"}$m$, 1690, 1),
  ('mug-450',      (select id from mlle_labeille.products where slug='mug'),      $m${"fr":"450 ml","en":"15 oz"}$m$, 1890, 2),
  ('affiche-a4',   (select id from mlle_labeille.products where slug='affiche'),  $m${"fr":"A4 · 21 × 29,7 cm","en":"A4 · 8.3 × 11.7 in"}$m$, 1490, 1),
  ('affiche-a3',   (select id from mlle_labeille.products where slug='affiche'),  $m${"fr":"A3 · 29,7 × 42 cm","en":"A3 · 11.7 × 16.5 in"}$m$, 1990, 2),
  ('affiche-30x40',(select id from mlle_labeille.products where slug='affiche'),  $m${"fr":"30 × 40 cm","en":"12 × 16 in"}$m$, 2290, 3),
  ('carte-a6',     (select id from mlle_labeille.products where slug='carte'),    $m${"fr":"A6 · pliée","en":"A6 · folded"}$m$, 490, 1),
  ('stickers-a5',  (select id from mlle_labeille.products where slug='stickers'), $m${"fr":"A5","en":"A5"}$m$, 690, 1),
  ('stickers-a4',  (select id from mlle_labeille.products where slug='stickers'), $m${"fr":"A4","en":"A4"}$m$, 990, 2),
  ('tote-unique',  (select id from mlle_labeille.products where slug='tote'),     $m${"fr":"38 × 42 cm","en":"15 × 16.5 in"}$m$, 1990, 1),
  ('carnet-a5',    (select id from mlle_labeille.products where slug='carnet'),   $m${"fr":"A5 · 128 pages","en":"A5 · 128 pages"}$m$, 1490, 1),
  ('body-3-6',     (select id from mlle_labeille.products where slug='body'),     $m${"fr":"3–6 mois","en":"3–6 months"}$m$, 2290, 1),
  ('body-6-12',    (select id from mlle_labeille.products where slug='body'),     $m${"fr":"6–12 mois","en":"6–12 months"}$m$, 2290, 2),
  ('coussin-40',   (select id from mlle_labeille.products where slug='coussin'),  $m${"fr":"40 × 40 cm","en":"16 × 16 in"}$m$, 2790, 1)
on conflict (id) do nothing;

-- Printify references for the mug variants ("Accent Coffee Mug (11, 15oz)",
-- Printify shop 28300555). Kept as updates — safe to rerun, and keeps
-- src/lib/catalogue/data.ts and Supabase in sync. 15oz colours are still
-- disabled on the Printify product side; enable one before taking live
-- orders for mug-450.
update mlle_labeille.product_variants
  set printify_blueprint_id = 635, printify_print_provider_id = 99, printify_variant_id = 72184
  where id = 'mug-325';
update mlle_labeille.product_variants
  set printify_blueprint_id = 635, printify_print_provider_id = 99, printify_variant_id = 105887
  where id = 'mug-450';

-- ---------------------------------------------------------------------------
-- Collections
-- ---------------------------------------------------------------------------
insert into mlle_labeille.collections (slug, name, subtitle, description, accent_color, tint_color, cover_illustration_slug, sort_order) values
  ('la-vie-en-jaune','La vie en jaune',
    $m${"fr":"Le monde du miel et des matins lumineux","en":"The world of honey and luminous mornings"}$m$,
    $m${"fr":"Des jaunes de miel, de paille et de soleil doux : la couleur d’origine de Mademoiselle l’Abeille, celle des jours qui commencent bien.","en":"Honey, straw and gentle sunshine yellows: Mademoiselle l’Abeille’s original colour, the colour of days that start well."}$m$,
    '#E3B351','#FAF0D8','abeille-sereine',1),
  ('la-vie-en-rose','La vie en rose',
    $m${"fr":"Tendresse, câlins et joues roses","en":"Tenderness, hugs and rosy cheeks"}$m$,
    $m${"fr":"Des roses poudrés et des cœurs légers, pour dire l’affection sans grands discours.","en":"Powdery pinks and light hearts, to express affection without long speeches."}$m$,
    '#C98781','#F7E9E6','petite-abeille-curieuse',2),
  ('la-vie-en-vert','La vie en vert',
    $m${"fr":"Respirer, s’étirer, se poser","en":"Breathe, stretch, settle"}$m$,
    $m${"fr":"Des verts d’eucalyptus et de prairie calme, pour les instants de yoga, de repos et de nature.","en":"Eucalyptus and quiet-meadow greens, for yoga moments, rest and nature."}$m$,
    '#9DB18C','#E4EBDD','abeille-trois-ballons',3),
  ('la-vie-en-bleu','La vie en bleu',
    $m${"fr":"Berceuses et ciels tranquilles","en":"Lullabies and tranquil skies"}$m$,
    $m${"fr":"Des bleus de layette et de ciel d’été, tout indiqués pour les naissances et les chambres d’enfants.","en":"Layette and summer-sky blues, made for births and children’s bedrooms."}$m$,
    '#8FB4CC','#EAF2F7','abeille-ballon-bleu',4)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Celebration categories
-- ---------------------------------------------------------------------------
insert into mlle_labeille.celebration_categories (slug, name, description, icon, tint_color, sort_order) values
  ('naissance', $m${"fr":"Naissance","en":"Birth"}$m$, $m${"fr":"Souhaiter la bienvenue avec un prénom, une date, un premier souvenir.","en":"Say welcome with a name, a date, a very first keepsake."}$m$, '🍼', '#EAF2F7', 1),
  ('anniversaire', $m${"fr":"Anniversaire","en":"Birthday"}$m$, $m${"fr":"Des bougies, des ballons et une abeille qui apporte le gâteau.","en":"Candles, balloons, and a bee arriving with the cake."}$m$, '🎂', '#FAF0D8', 2),
  ('amitie', $m${"fr":"Amitié","en":"Friendship"}$m$, $m${"fr":"Pour celles et ceux qui rendent la vie plus douce, simplement.","en":"For the people who simply make life softer."}$m$, '🤝', '#F7E9E6', 3),
  ('remerciement', $m${"fr":"Remerciement","en":"Thank you"}$m$, $m${"fr":"Un merci qui se garde : maîtresses, nounous, voisins au grand cœur.","en":"A thank-you to keep: teachers, nannies, big-hearted neighbours."}$m$, '🌼', '#FAF0D8', 4),
  ('amour', $m${"fr":"Amour","en":"Love"}$m$, $m${"fr":"Des mots doux illustrés, à offrir sans occasion particulière.","en":"Illustrated sweet nothings, no special occasion required."}$m$, '💗', '#F7E9E6', 5),
  ('yoga-bien-etre', $m${"fr":"Yoga & bien-être","en":"Yoga & well-being"}$m$, $m${"fr":"Respirer, s’étirer, sourire : la douceur comme discipline.","en":"Breathe, stretch, smile: softness as a practice."}$m$, '🧘', '#E4EBDD', 6),
  ('petites-attentions', $m${"fr":"Petites attentions","en":"Small kindnesses"}$m$, $m${"fr":"Parce que les petites choses ont une grande valeur.","en":"Because small things hold great value."}$m$, '🎁', '#FAF0D8', 7)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Illustrations
-- ---------------------------------------------------------------------------
insert into mlle_labeille.illustrations
  (slug, title, description, alt_text, background_color, image_path, is_placeholder, tags, status, featured, featured_order, personalization_template_id)
values
  ('abeille-sereine',
    $m${"fr":"L’Abeille sereine","en":"The Serene Bee"}$m$,
    $m${"fr":"Les yeux fermés, le sourire tranquille : Mademoiselle l’Abeille savoure l’instant présent. Une invitation à respirer, tout simplement.","en":"Eyes closed, a quiet smile: Mademoiselle l’Abeille savours the present moment. An invitation to simply breathe."}$m$,
    $m${"fr":"Petite abeille aquarellée aux yeux fermés et au sourire paisible, entourée d’étoiles dorées sur fond jaune pâle","en":"Small watercolour bee with closed eyes and a peaceful smile, surrounded by golden sparkles on a pale yellow background"}$m$,
    '#FBF7DC','/illustrations/abeille-sereine/full.webp',false,
    $m$[{"fr":"calme","en":"calm"},{"fr":"sérénité","en":"serenity"},{"fr":"yoga","en":"yoga"},{"fr":"méditation","en":"meditation"},{"fr":"jaune","en":"yellow"},{"fr":"douceur","en":"softness"}]$m$,
    'published',true,1,'douceur'),
  ('petite-abeille-curieuse',
    $m${"fr":"La Petite Curieuse","en":"The Little Curious One"}$m$,
    $m${"fr":"Debout sur ses petites pattes, l’œil pétillant, elle semble demander : « Et aujourd’hui, on découvre quoi ? »","en":"Standing on her little legs, eyes sparkling, she seems to ask: “So, what are we discovering today?”"}$m$,
    $m${"fr":"Petite abeille aquarellée debout, aux grands yeux curieux et joues roses, sur fond rose très pâle","en":"Small watercolour bee standing with big curious eyes and rosy cheeks on a very pale pink background"}$m$,
    '#F9EFEA','/illustrations/petite-abeille-curieuse/full.webp',true,
    $m$[{"fr":"curiosité","en":"curiosity"},{"fr":"rose","en":"pink"},{"fr":"enfance","en":"childhood"},{"fr":"malice","en":"mischief"}]$m$,
    'published',true,2,'douceur'),
  ('abeille-anniversaire-gateau',
    $m${"fr":"Le Gâteau de fête","en":"The Birthday Cake"}$m$,
    $m${"fr":"Nœud rouge à pois, gâteau aux fraises et nuée de ballons : quand Mademoiselle l’Abeille fête un anniversaire, elle ne fait pas les choses à moitié.","en":"Polka-dot bow, strawberry cake and a flurry of balloons: when Mademoiselle l’Abeille celebrates a birthday, she doesn’t do things by halves."}$m$,
    $m${"fr":"Abeille aquarellée portant un nœud rouge à pois, tenant un gâteau aux fraises, entourée de ballons pastel","en":"Watercolour bee wearing a red polka-dot bow, holding a strawberry cake, surrounded by pastel balloons"}$m$,
    '#FBF7DC','/illustrations/abeille-anniversaire-gateau/full.webp',true,
    $m$[{"fr":"anniversaire","en":"birthday"},{"fr":"gâteau","en":"cake"},{"fr":"ballons","en":"balloons"},{"fr":"fête","en":"party"},{"fr":"fraise","en":"strawberry"}]$m$,
    'published',true,3,'anniversaire'),
  ('abeille-pot-de-miel',
    $m${"fr":"Le Pot de miel","en":"The Honey Jar"}$m$,
    $m${"fr":"Son trésor entre les pattes, elle l’offre à qui sait lire les petites étiquettes. Ajoutez-y un prénom : le miel n’en sera que plus doux.","en":"Her treasure held tight, offered to anyone who reads little labels. Add a name — the honey only gets sweeter."}$m$,
    $m${"fr":"Abeille aquarellée souriante tenant un pot de miel avec une étiquette « Miel » et un prénom calligraphié","en":"Smiling watercolour bee holding a honey jar with a “Miel” label and a hand-lettered first name"}$m$,
    '#FAF0D8','/illustrations/abeille-pot-de-miel/full.webp',true,
    $m$[{"fr":"miel","en":"honey"},{"fr":"prénom","en":"name"},{"fr":"personnalisé","en":"personalized"},{"fr":"cadeau","en":"gift"}]$m$,
    'published',true,4,'douceur'),
  ('abeille-trois-ballons',
    $m${"fr":"L’Envolée aux trois ballons","en":"Three-Balloon Flight"}$m$,
    $m${"fr":"Un ballon soleil, un ballon prairie, un ballon tendresse — et la voilà partie livrer de la joie, quelque part où l’on en manque.","en":"A sunshine balloon, a meadow balloon, a tenderness balloon — and off she goes, delivering joy wherever it’s running low."}$m$,
    $m${"fr":"Abeille aquarellée s’envolant avec trois ballons orange, vert et rose sur fond crème","en":"Watercolour bee flying away with three balloons — orange, green and pink — on a cream background"}$m$,
    '#FBF7DC','/illustrations/abeille-trois-ballons/full.webp',true,
    $m$[{"fr":"ballons","en":"balloons"},{"fr":"joie","en":"joy"},{"fr":"vert","en":"green"},{"fr":"envol","en":"flight"}]$m$,
    'published',true,5,'anniversaire'),
  ('bebe-abeille',
    $m${"fr":"Bébé Abeille","en":"Baby Bee"}$m$,
    $m${"fr":"Toute ronde, toute neuve, avec ses ailes à pois : la plus petite habitante de la ruche vient d’arriver — et elle a déjà conquis tout le monde.","en":"Perfectly round, brand new, with polka-dot wings: the hive’s tiniest resident has just arrived — and already won everyone over."}$m$,
    $m${"fr":"Bébé abeille aquarellé tout rond aux ailes bleu pâle à pois, sur fond crème","en":"Round watercolour baby bee with pale-blue polka-dot wings on a cream background"}$m$,
    '#FBF7DC','/illustrations/bebe-abeille/full.webp',true,
    $m$[{"fr":"bébé","en":"baby"},{"fr":"naissance","en":"birth"},{"fr":"chambre d’enfant","en":"nursery"},{"fr":"bleu","en":"blue"}]$m$,
    'published',true,6,'naissance'),
  ('abeille-ballon-bleu',
    $m${"fr":"Le Ballon bleu","en":"The Blue Balloon"}$m$,
    $m${"fr":"Un seul ballon, mais choisi avec soin : bleu comme un ciel de berceuse. Parfait pour annoncer ou célébrer l’arrivée d’un petit garçon.","en":"Just one balloon, but carefully chosen: blue as a lullaby sky. Perfect to announce or celebrate a little boy’s arrival."}$m$,
    $m${"fr":"Abeille aquarellée souriante à côté d’un ballon bleu aquarelle, sur fond bleu layette","en":"Smiling watercolour bee beside a blue watercolour balloon on a layette-blue background"}$m$,
    '#DDEBF5','/illustrations/abeille-ballon-bleu/full.webp',true,
    $m$[{"fr":"ballon","en":"balloon"},{"fr":"bleu","en":"blue"},{"fr":"garçon","en":"boy"},{"fr":"naissance","en":"birth"}]$m$,
    'published',false,null,'naissance'),
  ('les-petites-abeilles',
    $m${"fr":"Les Petites Abeilles","en":"The Little Bees"}$m$,
    $m${"fr":"Cinq humeurs d’abeille sur une même planche : rêveuse, joyeuse, timide, câline, espiègle. Impossible de choisir ? Prenez-les toutes.","en":"Five bee moods on a single sheet: dreamy, joyful, shy, cuddly, mischievous. Can’t choose? Take them all."}$m$,
    $m${"fr":"Planche de cinq petites abeilles aquarellées dans différentes poses et expressions","en":"Sheet of five small watercolour bees in different poses and expressions"}$m$,
    '#F6EDDA','/illustrations/les-petites-abeilles/full.webp',true,
    $m$[{"fr":"stickers","en":"stickers"},{"fr":"planche","en":"sheet"},{"fr":"expressions","en":"expressions"},{"fr":"collection","en":"set"}]$m$,
    'published',false,null,null),
  ('quatre-petits-coeurs',
    $m${"fr":"Quatre Petits Cœurs","en":"Four Little Hearts"}$m$,
    $m${"fr":"Un câlin d’abeilles, un cœur serré tout contre soi, une révérence fleurie : quatre manières illustrées de dire « je t’aime bien, tu sais ».","en":"A bee hug, a heart held close, a flowery bow: four illustrated ways of saying “I’m rather fond of you, you know”."}$m$,
    $m${"fr":"Quatre vignettes d’abeilles aquarellées : abeille aux fleurs, deux abeilles qui s’enlacent, abeille au cœur rose, abeille toute ronde","en":"Four watercolour bee vignettes: a bee with flowers, two hugging bees, a bee holding a pink heart, a perfectly round bee"}$m$,
    '#F7E9E6','/illustrations/quatre-petits-coeurs/full.webp',true,
    $m$[{"fr":"amour","en":"love"},{"fr":"amitié","en":"friendship"},{"fr":"câlin","en":"hug"},{"fr":"cœur","en":"heart"}]$m$,
    'published',false,null,'douceur'),
  ('abeilles-happy-birthday',
    $m${"fr":"La Ronde des anniversaires","en":"The Birthday Round"}$m$,
    $m${"fr":"Toute la ruche s’est mise sur son trente-et-un : gâteaux, confettis et cadeaux pour souhaiter les anniversaires en fanfare feutrée.","en":"The whole hive is dressed up: cakes, confetti and gifts to celebrate birthdays with the gentlest of fanfares."}$m$,
    $m${"fr":"Planche d’abeilles aquarellées fêtant des anniversaires avec gâteaux, cadeaux, confettis et messages « Happy Birthday »","en":"Sheet of watercolour bees celebrating birthdays with cakes, gifts, confetti and “Happy Birthday” lettering"}$m$,
    '#FAF0D8','/illustrations/abeilles-happy-birthday/full.webp',true,
    $m$[{"fr":"anniversaire","en":"birthday"},{"fr":"confettis","en":"confetti"},{"fr":"cadeau","en":"gift"},{"fr":"planche","en":"sheet"}]$m$,
    'published',false,null,'anniversaire')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Links: collections ↔ illustrations
-- ---------------------------------------------------------------------------
insert into mlle_labeille.collection_illustrations (collection_id, illustration_id)
select c.id, i.id from (values
  ('la-vie-en-jaune','abeille-sereine'),
  ('la-vie-en-jaune','abeille-anniversaire-gateau'),
  ('la-vie-en-jaune','abeille-pot-de-miel'),
  ('la-vie-en-jaune','abeille-trois-ballons'),
  ('la-vie-en-jaune','bebe-abeille'),
  ('la-vie-en-jaune','les-petites-abeilles'),
  ('la-vie-en-jaune','abeilles-happy-birthday'),
  ('la-vie-en-rose','petite-abeille-curieuse'),
  ('la-vie-en-rose','abeille-anniversaire-gateau'),
  ('la-vie-en-rose','quatre-petits-coeurs'),
  ('la-vie-en-vert','abeille-trois-ballons'),
  ('la-vie-en-bleu','bebe-abeille'),
  ('la-vie-en-bleu','abeille-ballon-bleu')
) as v(cslug, islug)
join mlle_labeille.collections c on c.slug = v.cslug
join mlle_labeille.illustrations i on i.slug = v.islug
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Links: celebrations ↔ illustrations
-- ---------------------------------------------------------------------------
insert into mlle_labeille.celebration_illustrations (celebration_id, illustration_id)
select c.id, i.id from (values
  ('yoga-bien-etre','abeille-sereine'),
  ('petites-attentions','abeille-sereine'),
  ('petites-attentions','petite-abeille-curieuse'),
  ('amitie','petite-abeille-curieuse'),
  ('anniversaire','abeille-anniversaire-gateau'),
  ('naissance','abeille-pot-de-miel'),
  ('petites-attentions','abeille-pot-de-miel'),
  ('remerciement','abeille-pot-de-miel'),
  ('anniversaire','abeille-trois-ballons'),
  ('amitie','abeille-trois-ballons'),
  ('naissance','bebe-abeille'),
  ('naissance','abeille-ballon-bleu'),
  ('anniversaire','abeille-ballon-bleu'),
  ('petites-attentions','les-petites-abeilles'),
  ('amour','quatre-petits-coeurs'),
  ('amitie','quatre-petits-coeurs'),
  ('anniversaire','abeilles-happy-birthday')
) as v(cslug, islug)
join mlle_labeille.celebration_categories c on c.slug = v.cslug
join mlle_labeille.illustrations i on i.slug = v.islug
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Links: illustrations ↔ products
-- ---------------------------------------------------------------------------
insert into mlle_labeille.illustration_products (illustration_id, product_id)
select i.id, p.id from mlle_labeille.illustrations i
cross join mlle_labeille.products p
where p.slug in ('mug','affiche','carte','stickers','tote','carnet','coussin')
  and i.slug in ('abeille-sereine','petite-abeille-curieuse','abeille-anniversaire-gateau','abeille-pot-de-miel','abeille-trois-ballons','quatre-petits-coeurs')
on conflict do nothing;

insert into mlle_labeille.illustration_products (illustration_id, product_id)
select i.id, p.id from mlle_labeille.illustrations i
cross join mlle_labeille.products p
where p.slug in ('mug','affiche','carte','stickers','tote','carnet','coussin','body')
  and i.slug in ('bebe-abeille','abeille-ballon-bleu')
on conflict do nothing;

insert into mlle_labeille.illustration_products (illustration_id, product_id)
select i.id, p.id from mlle_labeille.illustrations i
cross join mlle_labeille.products p
where p.slug in ('stickers','affiche','carte','carnet')
  and i.slug = 'les-petites-abeilles'
on conflict do nothing;

insert into mlle_labeille.illustration_products (illustration_id, product_id)
select i.id, p.id from mlle_labeille.illustrations i
cross join mlle_labeille.products p
where p.slug in ('stickers','affiche','carte')
  and i.slug = 'abeilles-happy-birthday'
on conflict do nothing;


-- Droits explicites. RLS contrôle les lignes, ces GRANT contrôlent les opérations.
revoke all on all tables in schema mlle_labeille from public, anon, authenticated;
revoke all on all sequences in schema mlle_labeille from public, anon, authenticated;
revoke all on all functions in schema mlle_labeille from public, anon, authenticated;
grant usage on schema mlle_labeille to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema mlle_labeille to authenticated;
grant select on mlle_labeille.collections, mlle_labeille.celebration_categories,
 mlle_labeille.personalization_templates, mlle_labeille.personalization_fields,
 mlle_labeille.illustrations, mlle_labeille.illustration_images,
 mlle_labeille.collection_illustrations, mlle_labeille.celebration_illustrations,
 mlle_labeille.products, mlle_labeille.product_variants,
 mlle_labeille.illustration_products to anon;
grant insert on mlle_labeille.newsletter_subscribers, mlle_labeille.contact_messages to anon;
-- Empêcher l'auto-promotion, y compris par INSERT, UPDATE ou UPSERT.
revoke insert, update, delete on mlle_labeille.profiles from authenticated;
grant insert (id, display_name, preferred_locale) on mlle_labeille.profiles to authenticated;
grant update (display_name, preferred_locale) on mlle_labeille.profiles to authenticated;
revoke all on all functions in schema mlle_labeille_private from public, anon, authenticated;
grant usage on schema mlle_labeille_private to anon, authenticated, service_role;
grant execute on function mlle_labeille_private.is_admin() to anon, authenticated, service_role;
grant all on all tables in schema mlle_labeille to service_role;
grant all on all sequences in schema mlle_labeille to service_role;
-- Les fonctions de déclencheur restent exécutables par le moteur PostgreSQL.

notify pgrst, 'reload schema';
commit;

select 'Installation terminée' as resultat,
 (select count(*) from information_schema.tables where table_schema='mlle_labeille' and table_type='BASE TABLE') as tables,
 (select count(*) from mlle_labeille.illustrations) as illustrations,
 (select count(*) from mlle_labeille.products) as supports;
