# Supabase — installation & vérification

Base de données, authentification et stockage de la boutique MlleLAbeille.

## 1. Ordre d'exécution du SQL

Dans le **SQL Editor** du dashboard Supabase (ou via `supabase db push`), exécuter
les fichiers **dans cet ordre** :

| # | Fichier | Rôle |
|---|---------|------|
| 1 | `schema.sql`  | extensions, tables, index, triggers `updated_at`, fonction `is_admin()` |
| 2 | `rls.sql`     | activation RLS + toutes les policies |
| 3 | `storage.sql` | buckets de stockage + policies storage |
| 4 | `seed.sql`    | catalogue initial (10 illustrations, 4 collections, 7 célébrations, 8 supports) |

Chaque fichier est idempotent : le rejouer ne casse rien.

## 2. Variables d'environnement requises

À récupérer dans **Project Settings → API** :

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # SERVEUR UNIQUEMENT
```

⚠️ La clé `service_role` contourne la RLS. Elle ne doit **jamais** être préfixée
`NEXT_PUBLIC_`, jamais commitée, jamais exposée au navigateur. Elle n'est lue
que par `src/lib/supabase/admin.ts` (routes API serveur).

## 3. Étapes dans le dashboard

1. **Authentication → Providers** : activer *Email* (mot de passe).
   Optionnel : personnaliser les e-mails de confirmation (FR).
2. **Authentication → URL Configuration** : ajouter l'URL du site
   (`https://…vercel.app` + domaine final) dans *Site URL* et *Redirect URLs*.
3. **SQL Editor** : exécuter les 4 fichiers dans l'ordre ci-dessus.
4. **Storage** : vérifier que les 4 buckets existent
   (`illustrations-originals`, `illustrations-web`, `product-mockups`,
   `personalization-uploads`).
5. Créer votre compte client via le site, puis se donner le rôle admin :
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'votre@email');
   ```

## 4. Tester chaque policy RLS

Dans le SQL Editor, simuler un utilisateur avec
`select set_config('request.jwt.claims', '{"sub":"<user-uuid>","role":"authenticated"}', true);`
ou plus simplement tester depuis l'app :

| Test | Attendu |
|------|---------|
| Anonyme : `select * from illustrations` | uniquement `status='published'` |
| Anonyme : `insert into newsletter_subscribers` | ✅ accepté |
| Anonyme : `select * from newsletter_subscribers` | ❌ 0 ligne |
| Connecté : `select * from orders` | uniquement ses commandes |
| Connecté : `update orders set total_cents = 0` | ❌ refusé (aucune policy UPDATE) |
| Connecté : `update profiles set is_admin = true where id = auth.uid()` | ❌ refusé |
| Connecté : `insert into favorites (user_id, …) values (autre_uid, …)` | ❌ refusé |
| Connecté : `select * from addresses` | uniquement les siennes |

## 5. Ce qui reste manuel (volontairement)

- Marquer un profil `is_admin = true` (ci-dessus) — pas d'auto-promotion possible.
- Téléverser les illustrations originales dans `illustrations-originals`
  (le site sert aujourd'hui les images depuis `/public`, voir `docs/ASSETS.md` ;
  la migration vers Storage consiste à remplacer `image_path` par l'URL publique
  du bucket `illustrations-web`).
- Configurer les webhooks Stripe et Printify (voir `docs/DEPLOYMENT.md`).

## 6. Bascule du catalogue local → Supabase

Le storefront lit aujourd'hui `src/lib/catalogue/data.ts` (même contenu que
`seed.sql`). Pour basculer sur Supabase : implémenter les requêtes dans
`src/lib/catalogue/index.ts` (seul point d'accès aux données — les pages ne
touchent jamais les données directement). Les formes TypeScript et les tables
SQL sont déjà alignées champ à champ.
