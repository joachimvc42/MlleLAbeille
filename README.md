# MlleLAbeille 🐝

Boutique officielle de **Mademoiselle l’Abeille** — un petit monde illustré
rempli de douceur, de couleurs et de petits bonheurs.

L’illustration est le produit : on choisit d’abord un dessin qui touche,
puis son support (mug, affiche, carte, tote, carnet, body, coussin…),
son format, et — quand le dessin s’y prête — sa personnalisation
(prénom, date, petit mot).

## Stack

| Couche | Choix |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) + React 19 + TypeScript |
| Styles | Tailwind CSS 4, design system « cousu main » (rose poudré `#C98781`, miel `#E3B351`, crème) |
| Données | Supabase (Postgres + RLS, Auth, Storage) — **fallback local complet** sans configuration |
| Paiement | Stripe Checkout via une abstraction (`src/lib/payments`) — mode démo étiqueté sans clé |
| Fabrication | Printify (impression à la demande) via `src/lib/printify` |
| Images | pipeline sharp (`npm run assets`) → WebP 1600/800/320 |
| i18n | FR (défaut) + EN, routage `/fr/...` `/en/...` via `src/proxy.ts` |
| Déploiement | Vercel |

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000 → redirige vers /fr
```

Aucune variable d’environnement n’est requise en développement : catalogue
local, panier/favoris en localStorage, checkout en mode démo étiqueté.
Pour activer Supabase / Stripe / Printify : copier `.env.example` en
`.env.local` et remplir (voir `supabase/README.md`, `docs/DEPLOYMENT.md`,
`docs/PRINTIFY.md`).

### Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run assets` | régénère les images optimisées depuis `assets/illustrations/originals/` |

## Architecture

```
assets/illustrations/originals/   originaux (jamais modifiés)
public/illustrations/<slug>/      full/card/thumb.webp générés
scripts/process-images.mjs        pipeline sharp + placeholders
src/
  proxy.ts                        détection/redirection de langue
  app/[locale]/                   pages (accueil, illustrations, collections,
                                  célébrations, mon-histoire, recherche,
                                  favoris, panier, commande, compte, contact…)
  app/api/                        checkout, newsletter, contact,
                                  webhooks stripe & printify
  components/                     layout (TopBar, SideNav cousu, MobileNav,
                                  Footer) + boutique (cartes, configurateur,
                                  personnalisation avec aperçu, panier…)
  lib/
    catalogue/                    types + données + accès (point unique)
    i18n/                         dictionnaires FR/EN complets
    cart/, favorites/             providers localStorage
    personalization/              validation partagée client/serveur
    payments/                     abstraction Stripe / démo
    printify/                     client API + fulfillment
    supabase/                     clients browser / server / admin
    orders/, checkout/, seo/      pricing serveur, schémas zod, JSON-LD
supabase/                         schema.sql, rls.sql, storage.sql, seed.sql, README
docs/                             ASSETS.md, DEPLOYMENT.md, PRINTIFY.md
```

Principes clés :

- **Prix côté serveur** : le client n’envoie que des identifiants ; chaque
  commande est re-tarifée par `src/lib/orders/create.ts`.
- **RLS stricte** : catalogue public en lecture seule publiée, données client
  cloisonnées par utilisateur, commandes inaltérables par les clients
  (création/mise à jour uniquement via la clé service serveur).
- **Dégradation gracieuse** : chaque intégration absente est remplacée par un
  comportement honnête et étiqueté (jamais de faux paiement silencieux).
- **Accessibilité** : navigation clavier, focus visibles, `prefers-reduced-motion`,
  libellés horizontaux dans la barre verticale, dialogues natifs.
- **SEO** : metadata localisées, canonical + hreflang, Open Graph, sitemap,
  robots, JSON-LD (Organization, WebSite, Product, Breadcrumb).

## Ce qui attend une action externe

1. **9 illustrations originales** à déposer (`docs/ASSETS.md` — 1 commande).
2. **Clés Supabase** + exécution des 4 fichiers SQL (`supabase/README.md`).
3. **Clés Stripe** + webhook (`docs/DEPLOYMENT.md`).
4. **Token Printify** + mappage des variantes (`docs/PRINTIFY.md`).
5. **Domaine** et `NEXT_PUBLIC_SITE_URL` définitifs.
6. Optionnel : boucle audio douce dans `public/sounds/ambience.mp3`
   (le bouton son existe déjà et ne s’active jamais seul).
