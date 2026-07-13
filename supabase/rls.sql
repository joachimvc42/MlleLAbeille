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
alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid()));
  -- ^ a user can never flip their own is_admin flag

-- ---------------------------------------------------------------------------
-- Public catalogue: readable by everyone when published, writable by admins
-- ---------------------------------------------------------------------------
alter table public.collections enable row level security;
create policy "collections: public read"
  on public.collections for select using (true);
create policy "collections: admin write"
  on public.collections for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.celebration_categories enable row level security;
create policy "celebrations: public read"
  on public.celebration_categories for select using (true);
create policy "celebrations: admin write"
  on public.celebration_categories for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.personalization_templates enable row level security;
create policy "perso templates: public read"
  on public.personalization_templates for select using (true);
create policy "perso templates: admin write"
  on public.personalization_templates for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.personalization_fields enable row level security;
create policy "perso fields: public read"
  on public.personalization_fields for select using (true);
create policy "perso fields: admin write"
  on public.personalization_fields for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.illustrations enable row level security;
create policy "illustrations: public read published"
  on public.illustrations for select
  using (status = 'published' or public.is_admin());
create policy "illustrations: admin write"
  on public.illustrations for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.illustration_images enable row level security;
create policy "illustration images: public read"
  on public.illustration_images for select
  using (
    exists (
      select 1 from public.illustrations i
      where i.id = illustration_id
        and (i.status = 'published' or public.is_admin())
    )
  );
create policy "illustration images: admin write"
  on public.illustration_images for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.collection_illustrations enable row level security;
create policy "collection links: public read"
  on public.collection_illustrations for select using (true);
create policy "collection links: admin write"
  on public.collection_illustrations for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.celebration_illustrations enable row level security;
create policy "celebration links: public read"
  on public.celebration_illustrations for select using (true);
create policy "celebration links: admin write"
  on public.celebration_illustrations for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.products enable row level security;
create policy "products: public read active"
  on public.products for select
  using (active or public.is_admin());
create policy "products: admin write"
  on public.products for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.product_variants enable row level security;
create policy "variants: public read"
  on public.product_variants for select using (true);
create policy "variants: admin write"
  on public.product_variants for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.illustration_products enable row level security;
create policy "illustration products: public read"
  on public.illustration_products for select using (true);
create policy "illustration products: admin write"
  on public.illustration_products for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Favorites: strictly personal
-- ---------------------------------------------------------------------------
alter table public.favorites enable row level security;
create policy "favorites: own read"
  on public.favorites for select using (auth.uid() = user_id);
create policy "favorites: own insert"
  on public.favorites for insert with check (auth.uid() = user_id);
create policy "favorites: own delete"
  on public.favorites for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Addresses: strictly personal
-- ---------------------------------------------------------------------------
alter table public.addresses enable row level security;
create policy "addresses: own all"
  on public.addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Carts: strictly personal
-- ---------------------------------------------------------------------------
alter table public.carts enable row level security;
create policy "carts: own all"
  on public.carts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.cart_items enable row level security;
create policy "cart items: own all"
  on public.cart_items for all
  using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Orders: customers READ their own orders. No INSERT/UPDATE/DELETE policies
-- for customers — orders are created and updated exclusively by the server
-- (service-role key), so totals and paid statuses can never be tampered with.
-- ---------------------------------------------------------------------------
alter table public.orders enable row level security;
create policy "orders: own read"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

-- Admins can move orders through their lifecycle from the back office.
-- Customers still have no write policy at all.
create policy "orders: admin update"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

alter table public.order_items enable row level security;
create policy "order items: own read"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- Newsletter & contact: public can only INSERT; reading is admin-only.
-- (The storefront inserts via the service role, but these policies also
-- allow direct anonymous inserts, e.g. from edge functions.)
-- ---------------------------------------------------------------------------
alter table public.newsletter_subscribers enable row level security;
create policy "newsletter: public insert"
  on public.newsletter_subscribers for insert with check (true);
create policy "newsletter: admin read"
  on public.newsletter_subscribers for select using (public.is_admin());
create policy "newsletter: admin delete"
  on public.newsletter_subscribers for delete using (public.is_admin());

alter table public.contact_messages enable row level security;
create policy "contact: public insert"
  on public.contact_messages for insert with check (true);
create policy "contact: admin read"
  on public.contact_messages for select using (public.is_admin());
create policy "contact: admin update"
  on public.contact_messages for update
  using (public.is_admin()) with check (public.is_admin());
