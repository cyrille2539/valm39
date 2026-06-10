# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commandes

```bash
# Développement
npm run dev
# ou si npm plante (disque C: plein) :
node_modules/.bin/next dev

# Build production
npm run build

# Lint
npm run lint

# Vérification TypeScript (pas de script dédié)
node_modules/.bin/tsc --noEmit
```

Il n'existe **aucun fichier de test** dans ce projet — pas de Jest, Vitest ni autre framework. Les vérifications sont manuelles.

## Architecture

Next.js 16 App Router, React 19, TypeScript. Toutes les pages sont dans `src/app/` (convention fichier `page.tsx`). Tous les composants interactifs ont `'use client'` en première ligne. Les assets statiques sont dans `public/assets/` et référencés par chemin string (`"/assets/hero-home.jpg"`), jamais par import.

### Pages et routes

| Route | Fichier | Layout |
|---|---|---|
| `/` | `src/app/page.tsx` | Nav + footer **inline** (pas `<Layout>`) |
| `/realisations` | `src/app/realisations/page.tsx` | `<Layout>` |
| `/locations-saisonnieres` | `src/app/locations-saisonnieres/page.tsx` | `<Layout>` |
| `/investisseurs` | `src/app/investisseurs/page.tsx` | `<Layout>` |
| `/agences-immobilieres` | `src/app/agences-immobilieres/page.tsx` | `<Layout>` |
| `/admin` | `src/app/admin/page.tsx` | `<AdminGuard>` + `<Layout>` |
| `/admin/login` | `src/app/admin/login/page.tsx` | — |

`page.tsx` (Home) **n'utilise pas** `<Layout>` — nav et footer sont inline. Ne pas changer cette structure.

`AdminDashboard` a 3 onglets : « Médias » (`AdminMedia`), « Contacts » (`AdminContacts`) et « Avis » (`AdminTestimonials`).

### Providers globaux

`src/app/layout.tsx` — JSON-LD SEO, métadonnées globales, `lang="fr"`, fonts `next/font/google` (Lora + DM Sans), `<link rel="preconnect">` Supabase.  
`src/app/providers.tsx` — `QueryClientProvider` (TanStack Query v5), `TooltipProvider`, `AuthProvider`, deux toasters (`Toaster` Radix + `Sonner`).

### Supabase

Projet : `wriwpdmsayhvjjhuotqv`. Client dans `src/integrations/supabase/client.ts`.  
Variables d'env requises : `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (toutes deux publiques, dans `.env.local`).

Pour appliquer une migration SQL via l'API Management :
```
POST https://api.supabase.com/v1/projects/wriwpdmsayhvjjhuotqv/database/query
Authorization: Bearer {PAT}
User-Agent: supabase-cli/2.90.0   # obligatoire sinon Cloudflare bloque
Content-Type: application/json
Body: {"query": "<SQL>"}
```

**Client Supabase** (`src/integrations/supabase/client.ts`) — singleton via `globalThis._supabaseSingleton` pour éviter la race condition sur le verrou auth localStorage causée par Turbopack (hot-reload) + React StrictMode qui créent plusieurs instances concurrentes.

**Table `media_items`** :
- `display_on text[]` — valeurs : `"realisations"`, `"home_before_after"`, `"cat_card"`. Requête : `.contains("display_on", ["valeur"])`
- `category` — `cuisine | parquet | cloisons | peinture | électricité | autres`
- `image_url` — priorité ; helper `photoUrl(p)` : `p.image_url ?? p.after_image_url ?? p.before_image_url ?? null`
- `chantier_id` — regroupe les photos d'un même chantier ; clé dans `groupByChantier` : `item.chantier_id ?? item.id`

**Pair records (accueil Avant/Après)** — entrées dédiées dans `media_items` sans `image_url`, avec `before_image_url` + `after_image_url` + `display_on: ["home_before_after"]`. Détectées par `isPairRecord(p)` : `display_on` inclut `"home_before_after"` ET NOT `"realisations"` ; ou (ancien style) `!image_url && (before || after)`. Maximum 3 paires complètes autorisées. `AdminMedia` crée/met à jour un seul record pair par chantier via `upsertPair()`. `fetchItems()` répare automatiquement les orphelins (anciens records sans le tag). `openDetail()` dédoublonne les paires en conservant la plus complète.

**Table `chantiers`** : `id, nom, description, categorie, sort_order`. Vue utilitaire `media_items_with_chantier`.

Autres tables : `testimonials`, `user_roles`. Auth : Supabase Auth + RPC `has_role` → `user_roles`. Hook `useAuth` : `{ user, session, isAdmin, loading, signIn, signOut }`.

### Constantes de design

Le **ratio d'or φ = 1.618** est utilisé partout pour les proportions de carte : `CARD_H = CARD_W × 1.618`, `aspect-ratio 1/1.618` dans `ChantierStack` et `BeforeAfterCard`. Ne pas remplacer par des valeurs arbitraires.

La courbe d'animation standard est `cubic-bezier(0.22, 1, 0.36, 1)` (easing spring-like). Les animations de héros utilisent `scale 1.18 → 1.0` sur 11 s pour l'effet cinématique.

### Composants clés

**`AnimatedLogo`** — `<Image src="/assets/logo-valm391.png" width={144} height={144} />` dans un `motion.div` de 72 px de haut avec `overflow: visible` + `alignItems: flex-start` : l'image (144×144 px) dépasse sous la nav. La nav doit avoir `overflow-visible` pour que ça fonctionne. L'image logo est aussi utilisée comme favicon dans `src/app/icon.png`.

**`CategoryCarousel`** (`src/components/CategoryCarousel.tsx`) — carousel 3D CSS cylindrique.
- Type `Category` : `"tout" | "cuisine" | "parquet" | "cloisons" | "peinture" | "électricité" | "autres"`.
- Z-index explicite via `Math.round(Math.cos(angleDeg × π / 180) × 50) + 51`. **Ne jamais ajouter `backdropFilter` aux cartes** — ça casse le z-sort.
- Clic sur une carte → `pauseForever()`. Drag → `pause()` (reprise après 8 s). Ne pas fusionner ces deux fonctions.
- Prop `externalPaused?: boolean` — quand `true`, stoppe la rotation et annule le timer de reprise interne. Utilisé depuis `realisations/page.tsx` via `gridHovered` pour stopper le carousel quand la souris est sur la grille des chantiers.
- **Responsive mobile** : un `ResizeObserver` mesure le container ; `scale = min(1, containerW / NATIVE_W)` est appliqué via `transform: scale()` sur la scène positionnée en absolu. Le débordement horizontal est contenu par `overflow-x: clip` sur le wrapper du carousel dans `realisations/page.tsx` (pas `overflow: hidden` qui couperait la carte avant grossie ×1.44 par la perspective).

**`ChantierStack`** — pile de 1 à 3 cartes par chantier, aspect-ratio `1/1.618`.
- **Fan au hover** : desktop `rotate ±12°, x ±36px` ; mobile (`useIsMobile() === true`) `rotate ±8°, x 0`.
- **Géométrie critique** : une carte de ratio 1/1.618 rotée à θ° s'étend horizontalement de `H/2 × sin(θ)` au-delà de son container *même sans déplacement x*. À 12°, c'est ≈ 50 px. Réduire l'angle si les cartes débordent du viewport.
- Marge viewport sûre : `card_center_from_edge ≥ |x| + W/2×cos(θ) + H/2×sin(θ)`. Avec `px-6` section + `px-6` grille = 48 px total, angle ≤ 8° et x = 0 tient sur 375 px.
- **Z-index** : `position: relative` + `zIndex: hovered ? 10 : 1` sur le wrapper root. `hover:z-10 relative` sur les `motion.div` wrappers de la grille (pas en interne — le `motion.div` crée un stacking context qui confinerait le z-index enfant).
- **Titre** : `marginTop` animé via Framer Motion spring (16 → 44 px), **uniquement si `cards.length > 1`** — les cartes fan en `rotate ±12°, y +6` débordent de ~34 px sous le container et couvrent le titre avec `mt-4` seul.
- **Lightbox** — rendu via `createPortal(…, document.body)` pour échapper aux stacking contexts créés par les `transform` CSS de Framer Motion sur les wrappers parents (sinon la nav `z-50` passe au-dessus du lightbox `z-[200]`). Le `portalRoot` est initialisé dans un `useEffect` pour la compatibilité SSR. Fond `bg-black/90 backdrop-blur-sm` + textes `text-white` explicites — **ne pas utiliser `bg-charcoal/96`** (le modificateur d'opacité Tailwind ne fonctionne pas sur les couleurs définies comme `hsl(var(--custom))` dans le config). Chevrons `hidden sm:flex`, swipe touch (delta > 50 px), bouton X en `flex-none self-end` hors de la zone scrollable.

**`ServiceCard`** — expand-on-hover avec ratio d'or.
- `cardRef` doit être sur l'élément qui EST le flex item direct.
- `isAnyHovered` verrouille toutes les cartes simultanément. Conteneur flex : `items-start`.
- Image : `<Image fill>` next/image avec `sizes="(max-width: 1023px) 50vw, 20vw"` (grille 2-col mobile / flex-5 desktop). Le `transform: scale()` d'expansion est passé via le prop `style` de `<Image>`.
- Sur `page.tsx` (Home), les images des ServiceCards sont surchargées au montage par les `media_items` avec `display_on` contenant `"cat_card"` (même requête que `realisations/page.tsx`). Fallback sur les images statiques si aucune photo `cat_card` n'est définie pour la catégorie. Mapping catégorie→titre dans `SERVICE_CATEGORY`.

**`BeforeAfterSection`** — exporté par défaut. `BeforeAfterGallery.tsx` est un stub vide — toujours importer depuis `BeforeAfterSection.tsx`.
- Animation `clipPath` : split → covering (4s) → shimmer (1.5s × 2). Shimmer en `rgba(255,255,255,...)`, pas en `hsl(var(--primary))`.
- Le dégradé sombre et le bevel verre sont **en dehors** du `div.overflow-hidden`.
- Charge les paires depuis Supabase : `.contains("display_on", ["home_before_after"]).not("before_image_url", "is", null).not("after_image_url", "is", null).limit(3)` — jamais de paire incomplète, jamais plus de 3.
- `maxWidth: "calc(80vh / 1.618)"` sur chaque carte pour plafonner la hauteur à 80 vh quelle que soit la largeur du flex container.

**`VerticalCarousel`** — carousel scroll-driven (`useScroll` + `useTransform`). Items positionnés en `absolute`, décalés via `y = (index - activePos) * itemHeight`.
- Desktop : `itemHeight=110`, `maxScale=1.3`, `scaleStep=0.24`, `opacityStep=0.4`.
- Mobile (`useIsMobile()`) : `itemHeight=max(130, prop)`, `maxScale=1.0` (pas d'agrandissement — évite le chevauchement), `scaleStep=0.22`. Même `opacityStep=0.4`.
- Avec `maxScale=1.3`, les items adjacents (scale ~1.06) **chevauchent toujours** l'item actif — c'est un choix visuel desktop acceptable. Sur mobile scale 1.0 est impératif pour éviter l'overlap.

**`RulerNav`** — navigation desktop. Ordre : Accueil, Réalisations, Locations, Investisseurs, Agences.

**`ShinyButton`** (`src/components/ui/shiny-button.tsx`) — CTA principal.
- Props clés : `size` (`"sm"|"lg"`), `variant` (`"default"|"light"|"outline"`), `href` (ancre `<a>`), `to` (Next `<Link>`, prioritaire sur `href`), `magnetic` (défaut `true`, désactiver dans la nav), `lightBg` (ajuste le contraste sur fond clair).
- `lightBg` obligatoire sur fond clair. `magnetic={false}` dans la nav.

**`useIsMobile()`** (`src/hooks/use-mobile.tsx`) — breakpoint `768px` (`max-width: 767px`).
- Retourne `false` au premier rendu SSR (via `!!isMobile` qui convertit `undefined` en `false`), puis la vraie valeur après hydratation. Toujours un `boolean`, jamais `undefined`.

**`Layout`** (`src/components/Layout.tsx`) — wrapper partagé pour toutes les pages sauf Home.
- Div racine : `min-h-screen bg-background font-body` — pas d'`overflow` sur ce div, intentionnellement.
- Footer `lg:fixed lg:bottom-0` — fixe uniquement sur desktop ; en flux normal sur mobile/tablette.
- `MobileMenu` (bottom nav) rendu après le footer, visible uniquement `lg:hidden`.

### AdminMedia (`src/components/admin/AdminMedia.tsx`)

Gestion complète des chantiers et photos. Vue liste → vue détail chantier.

- **Par photo** : boutons-pilules [Avant] / [Après] / [Carte] pour affecter un rôle, sauvegarde immédiate.
- **Drag & drop** (`@dnd-kit/core` + `@dnd-kit/sortable`) : poignée `GripVertical` en haut de chaque carte, `handleDragEnd` met à jour `sort_order` en base.
- **`saveChantierMeta`** : `try/catch` global, boucle `for...of` séquentielle avec `if (error) throw error` — ne pas revenir à `Promise.all` qui avale les erreurs silencieusement.
- **`completePairsCount`** : compte uniquement les records avec `display_on` incluant `"home_before_after"` ET `before_image_url` ET `after_image_url` non null — aligné sur ce que `BeforeAfterSection` affiche réellement.

### Page Réalisations

`realisations/page.tsx` groupe les `media_items` par `chantier_id`. Fallback : `MOCK_CHANTIERS` (4 chantiers définis dans le fichier). `CATEGORY_CARDS` définit les 7 filtres du carousel. Filtrage : `activeFilter === "tout"` montre tout, sinon `chantier.categorie === activeFilter`.

Images des cartes catégorie : état `carouselCards` initialisé depuis `CATEGORY_CARDS`, surchargé au montage par les `media_items` avec `display_on` contenant `"cat_card"` (un par catégorie).

Points d'architecture spécifiques :
- Le wrapper `CategoryCarousel` a `style={{ overflowX: "clip" }}` — coupe le débordement horizontal du carousel sans créer de scroll container (contrairement à `overflow: hidden`).
- `gridHovered` state → `externalPaused={gridHovered}` sur `CategoryCarousel` — stoppe la rotation quand la souris est sur la grille.
- Grille : `px-6` en plus du `px-6` de la section parent = 48 px total depuis le bord viewport, nécessaire pour que le fan (rotation + déplacement) reste visible.
- `motion.div` wrappers de la grille : `className="relative hover:z-10"` — élève la cellule survolée au-dessus de ses voisines (les `motion.div` créent des stacking contexts qui empêchent le z-index interne de ChantierStack de fonctionner entre cellules).

### Structure de page.tsx (Home)

1. Hero — `hero-home.jpg`, letterbox + mots mot par mot
2. Services / Nos savoir-faire (`#services`) — flex expand-on-hover, badge "Certification AFPIA"
3. Avant/Après — `<BeforeAfterGallery />`
4. Pourquoi ValM39 — grands numéros watermark
5. Solutions par profil — même pattern ServiceCard
6. Contact (`#contact`) — formulaire (non connecté)
7. Footer fixe desktop

**Ne jamais imbriquer `<main>` dans le div racine de `page.tsx`** — casse les Intersection Observers Framer Motion.

### Design system

Palette Tailwind custom (`src/app/globals.css`) :
- `charcoal` — fond sombre (hero, contact, footer)
- `charcoal-soft` — titres sur fond clair
- `olive` / `olive-light` — accent italique hero
- `primary` (hsl 85) — vert olive, CTA et eyebrows

Typographie : `font-display` = Lora, `font-body` = DM Sans. Chargées via `next/font/google` dans `layout.tsx` (auto-hébergées au build, sans `@import` bloquant). Les variables CSS `--font-lora` et `--font-dm-sans` sont appliquées sur `<body>` ; Tailwind les référence via `var(--font-lora)` / `var(--font-dm-sans)` dans `tailwind.config.ts`.  
Eyebrow : `text-primary font-display italic text-5xl`. Titre : `font-display font-bold text-charcoal-soft text-3xl sm:text-4xl`.

### Images

Toutes dans `public/assets/`. Logo principal : `logo-valm391.png` (badge circulaire lynx, fond transparent). Favicon : `src/app/icon.png` (même image).

`next.config.ts` : `formats: ["image/webp"]` uniquement — l'AVIF est intentionnellement absent (décodage ~3× plus lent sur CPU mobile, nuit au LCP). Utiliser `<Image fill>` de `next/image` pour toutes les images non-logo. Pour les overlays et fonds sombres, utiliser `bg-black/X` plutôt que `bg-charcoal/X` (le modificateur d'opacité Tailwind ne fonctionne pas sur les couleurs CSS variables custom).

Pour générer de nouvelles images via fal.ai : le MCP est configuré dans `f:\sitemario\.mcp.json` avec la clé FAL_KEY. Modèle recommandé : `fal-ai/flux/dev`.

### Notifications email

Route API `src/app/api/notify-contact/route.ts` — appelée en fire-and-forget depuis `ContactForm` après un insert Supabase réussi. Envoie un email formaté via SMTP IONOS (`smtp.ionos.fr:587`, STARTTLS) à `contact@valm39.fr`. Variables d'env requises (Vercel + `.env.local`) : `IONOS_EMAIL`, `IONOS_PASSWORD`. L'échec email n'affecte pas le retour utilisateur.

### SEO

- `src/app/layout.tsx` — JSON-LD `HomeAndConstructionBusiness` (téléphone, horaires Mo-Fr 08:00-18:00, geo Saint-Claude) + métadonnées globales
- `src/app/opengraph-image.tsx` — image OG dynamique 1200×630 via `next/og` ImageResponse (logo + identité ValM39 sur fond charcoal). Pas de fichier `og-image.jpg` statique.
- `public/sitemap.xml`, `public/robots.txt`, `public/llms.txt`
- `usePageMeta` — title + canonical + OG par page via DOM (hook client-side)
- Domaine de production : `www.valm39.fr` (configuré sur Vercel + DNS IONOS)
