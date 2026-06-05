-- ============================================================
-- ValM39 — Migration complète Supabase
-- À coller dans : dashboard.supabase.com → SQL Editor → New query
-- ============================================================

-- ── 1. Types ─────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 2. Tables ────────────────────────────────────────────────

-- media_items : photos de réalisations (avant/après + gallery)
CREATE TABLE IF NOT EXISTS public.media_items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT NOT NULL DEFAULT '',
  description          TEXT NOT NULL DEFAULT '',
  location             TEXT NOT NULL DEFAULT '',
  category             TEXT NOT NULL DEFAULT 'autres',
  image_url            TEXT,
  before_image_url     TEXT,
  after_image_url      TEXT,
  display_on           TEXT[] NOT NULL DEFAULT '{}',
  sort_order           INTEGER NOT NULL DEFAULT 0,
  chantier_id          UUID,
  chantier_nom         TEXT,
  chantier_description TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- testimonials : avis clients
CREATE TABLE IF NOT EXISTS public.testimonials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT '',
  text       TEXT NOT NULL,
  stars      INTEGER NOT NULL DEFAULT 5 CHECK (stars >= 1 AND stars <= 5),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_roles : gestion des rôles admin
CREATE TABLE IF NOT EXISTS public.user_roles (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role    public.app_role NOT NULL,
  UNIQUE  (user_id, role)
);

-- ── 3. Trigger updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_media_items    ON public.media_items;
DROP TRIGGER IF EXISTS set_updated_at_testimonials   ON public.testimonials;

CREATE TRIGGER set_updated_at_media_items
  BEFORE UPDATE ON public.media_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_testimonials
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. Fonctions auth ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- ── 5. Row Level Security ────────────────────────────────────
ALTER TABLE public.media_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles   ENABLE ROW LEVEL SECURITY;

-- media_items : lecture publique, écriture admin
DROP POLICY IF EXISTS "media_items_select" ON public.media_items;
DROP POLICY IF EXISTS "media_items_insert" ON public.media_items;
DROP POLICY IF EXISTS "media_items_update" ON public.media_items;
DROP POLICY IF EXISTS "media_items_delete" ON public.media_items;

CREATE POLICY "media_items_select" ON public.media_items FOR SELECT USING (true);
CREATE POLICY "media_items_insert" ON public.media_items FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "media_items_update" ON public.media_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "media_items_delete" ON public.media_items FOR DELETE USING (public.is_admin());

-- testimonials : lecture publique, écriture admin
DROP POLICY IF EXISTS "testimonials_select" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_insert" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_update" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_delete" ON public.testimonials;

CREATE POLICY "testimonials_select" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "testimonials_insert" ON public.testimonials FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "testimonials_update" ON public.testimonials FOR UPDATE USING (public.is_admin());
CREATE POLICY "testimonials_delete" ON public.testimonials FOR DELETE USING (public.is_admin());

-- user_roles : admin uniquement
DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_all"    ON public.user_roles;

CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT USING (public.is_admin());
CREATE POLICY "user_roles_all"    ON public.user_roles FOR ALL   USING (public.is_admin());

-- ── 6. Données de démonstration (optionnel) ──────────────────
-- Décommente ces lignes pour insérer des avis et médias de test.

/*
INSERT INTO public.testimonials (name, role, text, stars, sort_order) VALUES
  ('Marie L.',         'Propriétaire Airbnb — Lons-le-Saunier', 'Notre taux de réservation a bondi de 35 % après la rénovation. Un travail remarquable, les voyageurs en parlent dans leurs avis.', 5, 1),
  ('Thierry M.',       'Investisseur immobilier — Dole',         'Devis tenu à l''euro près, chantier livré en avance. Je recommande ValM39 à tous mes associés.',                                5, 2),
  ('Sophie R.',        'Particulière — Champagnole',             'La cuisine posée est exactement ce que je rêvais. Finition impeccable, artisan à l''écoute.',                                    5, 3),
  ('Agence Immo Jura', 'Agence immobilière — Lons-le-Saunier',  'Nos biens rénovés par ValM39 se vendent 15 % plus vite. Un partenaire de confiance.',                                          5, 4)
ON CONFLICT DO NOTHING;
*/
