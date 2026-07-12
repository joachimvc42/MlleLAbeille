-- ============================================================================
-- MlleLAbeille — Seed data
-- Execute FOURTH (after storage.sql). Idempotent (on conflict do nothing /
-- update). Mirrors src/lib/catalogue/data.ts, the storefront's dev fallback.
-- Dollar-quoting ($m$…$m$) is used so French apostrophes stay untouched.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Personalization templates & fields
-- ---------------------------------------------------------------------------
insert into public.personalization_templates (id, name) values
  ('naissance',    $m${"fr":"Naissance","en":"Birth"}$m$),
  ('anniversaire', $m${"fr":"Anniversaire","en":"Birthday"}$m$),
  ('douceur',      $m${"fr":"Petit mot doux","en":"Sweet note"}$m$)
on conflict (id) do nothing;

insert into public.personalization_fields
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
insert into public.products (slug, name, description, personalizable, sort_order) values
  ('mug',      $m${"fr":"Mug en céramique","en":"Ceramic mug"}$m$,      $m${"fr":"Un mug tout doux pour les matins câlins, imprimé des deux côtés.","en":"A soft-hearted mug for cosy mornings, printed on both sides."}$m$, true, 1),
  ('affiche',  $m${"fr":"Affiche d’art","en":"Art print"}$m$,           $m${"fr":"Papier mat épais 200 g, couleurs douces et fidèles.","en":"Thick 200 gsm matte paper, soft and faithful colours."}$m$, true, 2),
  ('carte',    $m${"fr":"Carte double & enveloppe","en":"Greeting card & envelope"}$m$, $m${"fr":"Une carte à écrire, à offrir, à garder longtemps.","en":"A card to write, to give, to keep for a long time."}$m$, true, 3),
  ('stickers', $m${"fr":"Planche de stickers","en":"Sticker sheet"}$m$, $m${"fr":"Des petites abeilles à coller partout où il manque de la douceur.","en":"Little bees to stick wherever softness is missing."}$m$, false, 4),
  ('tote',     $m${"fr":"Tote bag en coton bio","en":"Organic cotton tote bag"}$m$, $m${"fr":"Pour emporter un peu de son petit monde partout avec soi.","en":"To carry a piece of her little world everywhere."}$m$, false, 5),
  ('carnet',   $m${"fr":"Carnet ligné","en":"Lined notebook"}$m$,       $m${"fr":"128 pages pour les listes, les rêves et les petits riens.","en":"128 pages for lists, dreams and lovely little nothings."}$m$, true, 6),
  ('body',     $m${"fr":"Body bébé en coton bio","en":"Organic cotton baby bodysuit"}$m$, $m${"fr":"Tout doux pour la peau des tout-petits, certifié coton biologique.","en":"Extra soft on tiny skin, certified organic cotton."}$m$, true, 7),
  ('coussin',  $m${"fr":"Coussin douillet","en":"Cosy cushion"}$m$,     $m${"fr":"Le coussin sur lequel Mademoiselle l’Abeille aime se reposer.","en":"The very cushion Mademoiselle l’Abeille likes to rest on."}$m$, false, 8)
on conflict (slug) do nothing;

insert into public.product_variants (id, product_id, name, price_cents, sort_order) values
  ('mug-325',      (select id from public.products where slug='mug'),      $m${"fr":"325 ml","en":"11 oz"}$m$, 1690, 1),
  ('mug-450',      (select id from public.products where slug='mug'),      $m${"fr":"450 ml","en":"15 oz"}$m$, 1890, 2),
  ('affiche-a4',   (select id from public.products where slug='affiche'),  $m${"fr":"A4 · 21 × 29,7 cm","en":"A4 · 8.3 × 11.7 in"}$m$, 1490, 1),
  ('affiche-a3',   (select id from public.products where slug='affiche'),  $m${"fr":"A3 · 29,7 × 42 cm","en":"A3 · 11.7 × 16.5 in"}$m$, 1990, 2),
  ('affiche-30x40',(select id from public.products where slug='affiche'),  $m${"fr":"30 × 40 cm","en":"12 × 16 in"}$m$, 2290, 3),
  ('carte-a6',     (select id from public.products where slug='carte'),    $m${"fr":"A6 · pliée","en":"A6 · folded"}$m$, 490, 1),
  ('stickers-a5',  (select id from public.products where slug='stickers'), $m${"fr":"A5","en":"A5"}$m$, 690, 1),
  ('stickers-a4',  (select id from public.products where slug='stickers'), $m${"fr":"A4","en":"A4"}$m$, 990, 2),
  ('tote-unique',  (select id from public.products where slug='tote'),     $m${"fr":"38 × 42 cm","en":"15 × 16.5 in"}$m$, 1990, 1),
  ('carnet-a5',    (select id from public.products where slug='carnet'),   $m${"fr":"A5 · 128 pages","en":"A5 · 128 pages"}$m$, 1490, 1),
  ('body-3-6',     (select id from public.products where slug='body'),     $m${"fr":"3–6 mois","en":"3–6 months"}$m$, 2290, 1),
  ('body-6-12',    (select id from public.products where slug='body'),     $m${"fr":"6–12 mois","en":"6–12 months"}$m$, 2290, 2),
  ('coussin-40',   (select id from public.products where slug='coussin'),  $m${"fr":"40 × 40 cm","en":"16 × 16 in"}$m$, 2790, 1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Collections
-- ---------------------------------------------------------------------------
insert into public.collections (slug, name, subtitle, description, accent_color, tint_color, cover_illustration_slug, sort_order) values
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
insert into public.celebration_categories (slug, name, description, icon, tint_color, sort_order) values
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
insert into public.illustrations
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
    '#FFFFFF','/illustrations/abeille-pot-de-miel/full.webp',true,
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
    '#FFFFFF','/illustrations/les-petites-abeilles/full.webp',true,
    $m$[{"fr":"stickers","en":"stickers"},{"fr":"planche","en":"sheet"},{"fr":"expressions","en":"expressions"},{"fr":"collection","en":"set"}]$m$,
    'published',false,null,null),
  ('quatre-petits-coeurs',
    $m${"fr":"Quatre Petits Cœurs","en":"Four Little Hearts"}$m$,
    $m${"fr":"Un câlin d’abeilles, un cœur serré tout contre soi, une révérence fleurie : quatre manières illustrées de dire « je t’aime bien, tu sais ».","en":"A bee hug, a heart held close, a flowery bow: four illustrated ways of saying “I’m rather fond of you, you know”."}$m$,
    $m${"fr":"Quatre vignettes d’abeilles aquarellées : abeille aux fleurs, deux abeilles qui s’enlacent, abeille au cœur rose, abeille toute ronde","en":"Four watercolour bee vignettes: a bee with flowers, two hugging bees, a bee holding a pink heart, a perfectly round bee"}$m$,
    '#FFFDF6','/illustrations/quatre-petits-coeurs/full.webp',true,
    $m$[{"fr":"amour","en":"love"},{"fr":"amitié","en":"friendship"},{"fr":"câlin","en":"hug"},{"fr":"cœur","en":"heart"}]$m$,
    'published',false,null,'douceur'),
  ('abeilles-happy-birthday',
    $m${"fr":"La Ronde des anniversaires","en":"The Birthday Round"}$m$,
    $m${"fr":"Toute la ruche s’est mise sur son trente-et-un : gâteaux, confettis et cadeaux pour souhaiter les anniversaires en fanfare feutrée.","en":"The whole hive is dressed up: cakes, confetti and gifts to celebrate birthdays with the gentlest of fanfares."}$m$,
    $m${"fr":"Planche d’abeilles aquarellées fêtant des anniversaires avec gâteaux, cadeaux, confettis et messages « Happy Birthday »","en":"Sheet of watercolour bees celebrating birthdays with cakes, gifts, confetti and “Happy Birthday” lettering"}$m$,
    '#FFFFFF','/illustrations/abeilles-happy-birthday/full.webp',true,
    $m$[{"fr":"anniversaire","en":"birthday"},{"fr":"confettis","en":"confetti"},{"fr":"cadeau","en":"gift"},{"fr":"planche","en":"sheet"}]$m$,
    'published',false,null,'anniversaire')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Links: collections ↔ illustrations
-- ---------------------------------------------------------------------------
insert into public.collection_illustrations (collection_id, illustration_id)
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
join public.collections c on c.slug = v.cslug
join public.illustrations i on i.slug = v.islug
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Links: celebrations ↔ illustrations
-- ---------------------------------------------------------------------------
insert into public.celebration_illustrations (celebration_id, illustration_id)
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
join public.celebration_categories c on c.slug = v.cslug
join public.illustrations i on i.slug = v.islug
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Links: illustrations ↔ products
-- ---------------------------------------------------------------------------
insert into public.illustration_products (illustration_id, product_id)
select i.id, p.id from public.illustrations i
cross join public.products p
where p.slug in ('mug','affiche','carte','stickers','tote','carnet','coussin')
  and i.slug in ('abeille-sereine','petite-abeille-curieuse','abeille-anniversaire-gateau','abeille-pot-de-miel','abeille-trois-ballons','quatre-petits-coeurs')
on conflict do nothing;

insert into public.illustration_products (illustration_id, product_id)
select i.id, p.id from public.illustrations i
cross join public.products p
where p.slug in ('mug','affiche','carte','stickers','tote','carnet','coussin','body')
  and i.slug in ('bebe-abeille','abeille-ballon-bleu')
on conflict do nothing;

insert into public.illustration_products (illustration_id, product_id)
select i.id, p.id from public.illustrations i
cross join public.products p
where p.slug in ('stickers','affiche','carte','carnet')
  and i.slug = 'les-petites-abeilles'
on conflict do nothing;

insert into public.illustration_products (illustration_id, product_id)
select i.id, p.id from public.illustrations i
cross join public.products p
where p.slug in ('stickers','affiche','carte')
  and i.slug = 'abeilles-happy-birthday'
on conflict do nothing;
