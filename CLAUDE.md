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

`AdminDashboard` a 2 onglets : « Médias » (`AdminMedia`) et « Avis » (`AdminTestimonials`).

### Providers globaux

`src/app/layout.tsx` — JSON-LD SEO, métadonnées globales, `lang="fr"`.  
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

**Table `media_items`** :
- `display_on text[]` — `"home_before_after"` ou `"realisations"`. Requête : `.contains("display_on", ["valeur"])`
- `category` — `cuisine | parquet | cloisons | peinture | électricité | autres`
- `image_url` — priorité ; fallback : `image_url ?? after_image_url ?? before_image_url`
- `chantier_id` — FK vers `chantiers.id`

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
- **Responsive mobile** : un `ResizeObserver` mesure le container ; `scale = min(1, containerW / NATIVE_W)` est appliqué via `transform: scale()` sur la scène positionnée en absolu. Le scroll horizontal est géré par `overflow-x-hidden` sur `Layout`, pas par `overflow: hidden` sur le carousel (qui couperait la carte avant grossie ×1.44 par la perspective).

**`ChantierStack`** — pile de 1 à 3 cartes par chantier, aspect-ratio `1/1.618`.
- Fan au hover : ±12° / ±36px. Grille : `gap-x-20 gap-y-20` minimum.
- Lightbox intégrée avec chevrons `hidden sm:flex` et swipe touch (delta > 50px).

**`ServiceCard`** — expand-on-hover avec ratio d'or.
- `cardRef` doit être sur l'élément qui EST le flex item direct.
- `isAnyHovered` verrouille toutes les cartes simultanément. Conteneur flex : `items-start`.

**`BeforeAfterSection`** — exporté par défaut. `BeforeAfterGallery.tsx` est un stub vide — toujours importer depuis `BeforeAfterSection.tsx`.
- Animation `clipPath` : split → covering (4s) → shimmer (1.5s × 2). Shimmer en `rgba(255,255,255,...)`, pas en `hsl(var(--primary))`.
- Le dégradé sombre et le bevel verre sont **en dehors** du `div.overflow-hidden`.

**`RulerNav`** — navigation desktop. Ordre : Accueil, Réalisations, Locations, Investisseurs, Agences.

**`ShinyButton`** (`src/components/ui/shiny-button.tsx`) — CTA principal.
- Props clés : `size` (`"sm"|"lg"`), `variant` (`"default"|"light"|"outline"`), `href` (ancre `<a>`), `to` (Next `<Link>`, prioritaire sur `href`), `magnetic` (défaut `true`, désactiver dans la nav), `lightBg` (ajuste le contraste sur fond clair).
- `lightBg` obligatoire sur fond clair. `magnetic={false}` dans la nav.

**`useIsMobile()`** (`src/hooks/use-mobile.tsx`) — breakpoint `768px` (`max-width: 767px`).
- Retourne `undefined` au premier rendu SSR, puis `boolean` après hydratation. Ne jamais utiliser dans des calculs de layout qui s'exécutent au rendu initial sans vérifier `!== undefined`.

**`Layout`** (`src/components/Layout.tsx`) — wrapper partagé pour toutes les pages sauf Home.
- `overflow-x-hidden` sur le div racine pour contenir les débordements horizontaux (ex. carousel mobile).
- Footer `lg:fixed lg:bottom-0` — fixe uniquement sur desktop ; en flux normal sur mobile/tablette.
- `MobileMenu` (bottom nav) rendu après le footer, visible uniquement `lg:hidden`.

### Page Réalisations

`realisations/page.tsx` groupe les `media_items` par `chantier_id`. Fallback : `MOCK_CHANTIERS` (4 chantiers définis dans le fichier). `CATEGORY_CARDS` définit les 7 filtres du carousel. Filtrage : `activeFilter === "tout"` montre tout, sinon `chantier.categorie === activeFilter`.

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

Typographie : `font-display` = Lora, `font-body` = DM Sans.  
Eyebrow : `text-primary font-display italic text-5xl`. Titre : `font-display font-bold text-charcoal-soft text-3xl sm:text-4xl`.

### Images

Toutes dans `public/assets/`. Logo principal : `logo-valm391.png` (badge circulaire lynx, fond transparent). Favicon : `src/app/icon.png` (même image).

Pour générer de nouvelles images via fal.ai : le MCP est configuré dans `f:\sitemario\.mcp.json` avec la clé FAL_KEY. Modèle recommandé : `fal-ai/flux/dev`.

### SEO

- `src/app/layout.tsx` — JSON-LD `HomeAndConstructionBusiness` + métadonnées globales
- `public/sitemap.xml`, `public/robots.txt`, `public/llms.txt`
- `usePageMeta` — title + canonical + OG par page via DOM (hook client-side)

Remplacer `https://www.valm39.fr` par le vrai domaine dans `layout.tsx`, `sitemap.xml`, `robots.txt`, `llms.txt` et tous les appels `usePageMeta`.
