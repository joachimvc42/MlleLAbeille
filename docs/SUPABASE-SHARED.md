# Supabase partagé — Mademoiselle l’Abeille

## Installation effectuée
Projet : `crlzihbtsmznbxtwnura`.
Le 7 septembre 2026, les migrations suivantes ont été appliquées :
- `install_mlle_labeille_isolated_schema` : 20 tables dans `mlle_labeille`, RLS, catalogue initial et 4 buckets préfixés `mlle-labeille-`.
- `expose_mlle_labeille_api_schema` : ajoute `mlle_labeille` aux schémas API `public, graphql_public`.

Les fonctions privilégiées se trouvent dans `mlle_labeille_private`, non exposé à l’API. Les objets de l’autre application sont conservés.
Le script `supabase/shared-project/install.sql` documente l’installation initiale. **Ne pas le rejouer sur ce projet** : il s’arrête si le schéma existe.

L’exposition API est définie par `ALTER ROLE authenticator SET pgrst.db_schemas`. Le tableau de bord ne pilote plus cette liste tant que cette surcharge existe. Toute modification future doit conserver les schémas des deux applications.

## Configuration du site
Copier `.env.example` vers `.env.local` pour le développement, et renseigner les mêmes variables chez l’hébergeur :
- `NEXT_PUBLIC_SUPABASE_URL` : URL du projet.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : clé publique (la clé publishable moderne fonctionne aussi sous ce nom).
- `NEXT_PUBLIC_SUPABASE_SCHEMA=mlle_labeille` : schéma de toutes les requêtes de données, y compris le catalogue et le proxy admin.
- `SUPABASE_SERVICE_ROLE_KEY` : clé serveur du projet, nécessaire aux commandes, au contact, à la newsletter et à l’administration. Jamais dans une variable NEXT_PUBLIC.
- `ADMIN_PASSWORD` : mot de passe privé de l’Atelier, sans valeur par défaut.
- `NEXT_PUBLIC_SITE_URL` : URL du site déployé.

Une clé serveur Supabase a des droits sur les deux applications ; le schéma configuré limite les requêtes normales du site, mais ne réduit pas les privilèges de cette clé.

Les fichiers d’environnement locaux sont ignorés par Git. Le déploiement nécessite de renseigner les variables chez l’hébergeur puis de redéployer. Les clés de paiement et Printify restent gérées séparément.

## Comptes et sessions
Les utilisateurs et paramètres Supabase Auth sont communs aux applications.
Un déclencheur Abeille distinct crée un profil minimal pour chaque nouvelle inscription. Les comptes déjà présents obtiennent leur profil Abeille à l’ouverture de la page Compte, sans copier le profil de l’autre application.

Les cookies Abeille utilisent le nom `mlle-labeille-auth`, identique côté navigateur et serveur. La déconnexion du compte utilise `scope: "local"` pour ne pas déconnecter toutes les autres sessions de l’utilisateur.
Les clients peuvent modifier leur nom, mais pas leur identifiant ni leur indicateur `is_admin`.

L’Atelier du code actuel utilise `ADMIN_PASSWORD` et le proxy serveur (ce n’est pas le rôle profiles.is_admin qui ouvre cet écran). Sans ADMIN_PASSWORD, l’accès est refusé. Sans clé serveur, les opérations de données de l’Atelier ne fonctionnent pas.

## Stockage
- `mlle-labeille-illustrations-originals` : privé.
- `mlle-labeille-illustrations-web` : public.
- `mlle-labeille-product-mockups` : public.
- `mlle-labeille-personalization-uploads` : privé, dossier de l’utilisateur.

Le site actuel sert les images du catalogue depuis `public/illustrations` ; aucune API Storage active n’avait besoin d’être renommée. Utiliser ces noms préfixés pour de futurs téléversements. Aucun fichier de l’ancien projet n’a été transféré.

## Validation
- Installation et règles testées localement sur PostgreSQL embarqué (PGlite).
- Contrôles sur le projet réel, dans une transaction annulée : isolation des profils, modification du nom, refus de promotion admin, refus de lecture anonyme des profils.
- Catalogue réel accessible par API : HTTP 200, 10 illustrations.
- Audit sécurité Supabase : aucune alerte spécifique aux nouveaux schémas Abeille lors du contrôle.
- L’autre application a des alertes préexistantes ; elles n’ont pas été modifiées dans cette intervention.

Commandes :
```sh
npm ci
npm run typecheck
npm run lint
npm run build
node scripts/check-supabase.mjs
```

Le script API utilise les variables de `.env.local` et n’affiche pas les clés.

## Références
- https://supabase.com/docs/guides/api/using-custom-schemas
- https://supabase.com/docs/guides/troubleshooting/postgrest-error-pgrst002-could-not-query-the-database-for-the-schema-cache-c396e9

