# Illustrations — pipeline d'assets

## État actuel

Sur les **10 illustrations** du catalogue, **1 fichier original** a été fourni
(`abeille-sereine`, 2048 × 2048 px). Les 9 autres ont été décrites et
cataloguées (titres, textes, tags, collections, célébrations, alt-text FR/EN),
mais leurs fichiers n'ont pas pu être transmis — le site affiche pour elles un
**visuel provisoire généré** (l'abeille de référence dans une fenêtre ronde sur
le fond coloré propre à chaque illustration).

## Remplacer les visuels provisoires (1 commande)

1. Déposer chaque fichier original dans `assets/illustrations/originals/`
   avec **exactement** ce nom :

   | Fichier attendu | Illustration |
   |---|---|
   | `petite-abeille-curieuse.png` | abeille debout, fond rose pâle |
   | `abeille-anniversaire-gateau.png` | nœud rouge, gâteau, ballons |
   | `abeille-pot-de-miel.png` | pot « Miel » + prénom |
   | `abeille-trois-ballons.png` | envol, ballons orange/vert/rose |
   | `bebe-abeille.png` | grosse abeille ronde, ailes à pois |
   | `abeille-ballon-bleu.png` | ballon bleu, fond layette |
   | `les-petites-abeilles.png` | planche de 5 abeilles |
   | `quatre-petits-coeurs.png` | 4 vignettes cœurs/câlins |
   | `abeilles-happy-birthday.png` | planche Happy Birthday |

2. Lancer :

   ```bash
   npm run assets
   ```

3. Commit : `git add assets public && git commit -m "assets: illustrations originales"`

Le script régénère `public/illustrations/<slug>/{full,card,thumb}.webp`
(1600 / 800 / 320 px, qualité 88/84/80) et n'écrase **jamais** les originaux.
Le flag `placeholder` peut alors être passé à `false` dans
`src/lib/catalogue/data.ts` (et `is_placeholder` dans Supabase).

## Classification (à confirmer par la créatrice)

Choix éditoriaux faits sans blocage, facilement modifiables dans
`src/lib/catalogue/data.ts` + `supabase/seed.sql` :

- « La vie en bleu » a été ajoutée aux 3 collections officielles pour
  accueillir les visuels layette (ballon bleu, bébé abeille).
- Les planches (5 abeilles, Happy Birthday) sont traitées comme une seule
  illustration chacune, orientées stickers/affiches.
- `quatre-petits-coeurs` regroupe 4 vignettes en une œuvre « Amour/Amitié ».
- Les prix (4,90 € la carte → 27,90 € le coussin) sont des valeurs de
  lancement raisonnables à ajuster librement.
