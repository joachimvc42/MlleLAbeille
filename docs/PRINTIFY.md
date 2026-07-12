# Printify — impression à la demande

L'intégration est **prête côté code** ; il ne manque que les identifiants du
compte et le mappage des variantes.

## 1. Connecter le compte

1. Printify → *My profile → Connections → API tokens* → générer un token
   → `PRINTIFY_API_TOKEN`.
2. Récupérer l'identifiant de boutique : `GET https://api.printify.com/v1/shops.json`
   (ou via `listPrintifyShops()` dans `src/lib/printify/client.ts`)
   → `PRINTIFY_SHOP_ID`.

## 2. Mapper les produits

Chaque variante du catalogue porte trois références Printify, aujourd'hui
`null` :

- `blueprintId` — le produit du catalogue Printify (ex. mug 11 oz)
- `printProviderId` — l'imprimeur choisi
- `variantId` — la déclinaison exacte (taille/couleur)

Où les renseigner :

1. `src/lib/catalogue/data.ts` → `products[].variants[].printify`
2. `supabase/seed.sql` / table `product_variants`
   (`printify_blueprint_id`, `printify_print_provider_id`, `printify_variant_id`)

Comment les trouver : `GET /v1/catalog/blueprints.json`, puis
`/v1/catalog/blueprints/{id}/print_providers.json`, puis
`/{provider}/variants.json` — ou depuis l'URL du produit dans le dashboard.

## 3. Fonctionnement

- Au paiement Stripe confirmé, `src/app/api/webhooks/stripe/route.ts` appelle
  `fulfillWithPrintify()` (`src/lib/printify/fulfillment.ts`).
- Les lignes **mappées** partent en production Printify
  (`external_id` = référence de commande `MLB-…`) ; la commande passe en
  `processing`.
- Les lignes **non mappées** restent en traitement manuel — rien n'est bloqué.
- Webhooks retour (expédition/livraison) : Printify → *Settings → Webhooks* →
  `https://<domaine>/api/webhooks/printify` pour `order:shipment:created` et
  `order:shipment:delivered` (+ `PRINTIFY_WEBHOOK_SECRET` optionnel).
  Les commandes passent alors `shipped` puis `delivered`.

## 4. Personnalisation

Les commandes personnalisées (prénom, date, message) nécessitent la
génération d'un fichier d'impression par commande (texte incrusté dans
l'illustration). Deux options, non implémentées par défaut :

1. **Manuel** : la personnalisation est stockée sur chaque `order_item`
   (`personalization` jsonb) — préparer le fichier et passer la commande
   Printify à la main.
2. **Automatique** (extension future) : générer l'image composite avec sharp
   (même technique que `scripts/process-images.mjs`), l'uploader via
   `POST /v1/uploads/images.json`, puis créer la commande avec `print_areas`.
   La structure de `createPrintifyOrder()` le permet déjà.
