# Déploiement — Vercel, Supabase, Stripe, Printify

## 1. Vercel

- **Framework** : Next.js (auto-détecté) · **Build command** : `next build`
  (défaut) · **Node** : 22.
- Importer le repo GitHub `joachimvc42/MlleLAbeille` dans Vercel
  (*Add New → Project*). Chaque PR crée une *Preview Deployment* ;
  `main` déploie en production.
- **Variables d'environnement** (Project Settings → Environment Variables) :
  copier les clés de `.env.example`. Seule `NEXT_PUBLIC_SITE_URL` est
  recommandée dès le départ (l'URL de prod), tout le reste est optionnel —
  le site fonctionne en mode démo sans aucune clé.

### Domaine

1. Vercel → Settings → Domains → ajouter `mllelabeille.com` (ou autre).
2. Suivre les instructions DNS (CNAME `cname.vercel-dns.com`).
3. Mettre à jour `NEXT_PUBLIC_SITE_URL`, puis re-déployer.
4. Reporter le domaine dans Supabase (Auth → URL Configuration) et Stripe
   (webhook endpoint).

### Checklist production

- [ ] `npm run lint` + `npm run typecheck` + `npm run build` verts en local
- [ ] Variables Supabase renseignées + SQL exécuté (`supabase/README.md`)
- [ ] Un compte admin marqué `is_admin = true`
- [ ] Clés Stripe **live** + webhook configuré + `STRIPE_WEBHOOK_SECRET`
- [ ] Token Printify + `PRINTIFY_SHOP_ID` + variantes mappées (`docs/PRINTIFY.md`)
- [ ] Illustrations originales déposées + `npm run assets` (`docs/ASSETS.md`)
- [ ] `NEXT_PUBLIC_SITE_URL` = domaine final
- [ ] Test de commande complet en mode test Stripe

## 2. Stripe

1. Créer le compte Stripe (ou utiliser l'existant), récupérer la
   **clé secrète** (`sk_test_…` d'abord) → `STRIPE_SECRET_KEY`.
2. Dashboard → Developers → **Webhooks** → *Add endpoint* :
   - URL : `https://<votre-domaine>/api/webhooks/stripe`
   - Événement : `checkout.session.completed`
   - Copier le *Signing secret* → `STRIPE_WEBHOOK_SECRET`.
3. Redéployer. Le checkout passe automatiquement de « mode démo » à
   Stripe Checkout (aucun changement de code).

Flux : commande → session Stripe (prix recalculés côté serveur) → paiement →
webhook → commande `paid` dans Supabase → transmission Printify si configuré.

## 3. Printify

Voir `docs/PRINTIFY.md` (création des produits, récupération des
`blueprint_id` / `print_provider_id` / `variant_id`, webhooks d'expédition).

## 4. Supabase

Voir `supabase/README.md` (ordre SQL, RLS, buckets, tests).
