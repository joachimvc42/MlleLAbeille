# Déploiement — Vercel, Supabase, Stripe/Xendit, Printify

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
4. Reporter le domaine dans Supabase (Auth → URL Configuration) et
   Stripe/Xendit (webhook endpoint).

### Checklist production

- [ ] `npm run lint` + `npm run typecheck` + `npm run build` verts en local
- [ ] Variables Supabase renseignées + SQL exécuté (`supabase/README.md`)
- [ ] Un compte admin marqué `is_admin = true` (ou `ADMIN_PASSWORD` changé)
- [ ] Clés Stripe **live** + webhook configuré + `STRIPE_WEBHOOK_SECRET`
      — ou, à défaut, `XENDIT_SECRET_KEY` + `XENDIT_WEBHOOK_TOKEN`
- [ ] Token Printify + `PRINTIFY_SHOP_ID` + variantes mappées (`docs/PRINTIFY.md`)
- [ ] Illustrations originales déposées + `npm run assets` (`docs/ASSETS.md`)
- [ ] `NEXT_PUBLIC_SITE_URL` = domaine final
- [ ] Test de commande complet en mode test (Stripe ou Xendit)

## 2. Paiement — Stripe ou Xendit

Stripe est utilisé s'il est configuré ; sinon le checkout bascule
automatiquement sur Xendit s'il est configuré ; sans aucun des deux, le
checkout reste en mode démo (clairement affiché). Configurer un seul des
deux suffit — inutile de faire les deux sections ci-dessous.

### Stripe

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

### Xendit

1. Créer le compte Xendit, récupérer la **clé secrète** (mode test d'abord,
   *Settings → API keys*) → `XENDIT_SECRET_KEY`.
2. *Settings → Webhooks → Invoices callback* :
   - URL : `https://<votre-domaine>/api/webhooks/xendit`
   - Copier le *Verification Token* affiché sur cette page →
     `XENDIT_WEBHOOK_TOKEN`.
3. Ne pas renseigner `STRIPE_SECRET_KEY` (ou le retirer) pour que Xendit
   prenne le relais. Redéployer.

Flux : commande → facture hébergée Xendit → paiement → webhook (`x-callback-
token` vérifié) → commande `paid` dans Supabase → transmission Printify si
configuré. Identique au flux Stripe, seul le fournisseur change.

## 3. Printify

Voir `docs/PRINTIFY.md` (création des produits, récupération des
`blueprint_id` / `print_provider_id` / `variant_id`, webhooks d'expédition).

## 4. Supabase

Voir `supabase/README.md` (ordre SQL, RLS, buckets, tests).
