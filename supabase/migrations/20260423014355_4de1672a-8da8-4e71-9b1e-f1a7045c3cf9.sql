-- =========================================================
-- ENUMS NOVOS
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'moderator', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.negotiation_status AS ENUM ('open', 'in_progress', 'closed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.product_type AS ENUM ('seedling', 'harvest', 'service', 'material', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.points_source AS ENUM ('planting', 'consortium', 'redeem', 'adjustment', 'sale');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.validation_target AS ENUM ('seedling', 'consortium');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- AJUSTES EM TABELAS EXISTENTES
-- =========================================================

-- profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'user';

-- species
ALTER TABLE public.species
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS base_points INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS species_slug_key ON public.species(slug) WHERE slug IS NOT NULL;

-- consortia
ALTER TABLE public.consortia
  ADD COLUMN IF NOT EXISTS bonus_points INTEGER NOT NULL DEFAULT 50;

-- plantings
ALTER TABLE public.plantings
  ADD COLUMN IF NOT EXISTS custom_species_name TEXT;

-- products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS product_type public.product_type NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS sustainable_category TEXT,
  ADD COLUMN IF NOT EXISTS species_id UUID REFERENCES public.species(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'un',
  ADD COLUMN IF NOT EXISTS blockchain_hash TEXT,
  ADD COLUMN IF NOT EXISTS commercial_verification_note TEXT;

-- =========================================================
-- NOVAS TABELAS
-- =========================================================

-- VALIDATIONS
CREATE TABLE IF NOT EXISTS public.validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type public.validation_target NOT NULL,
  target_id UUID NOT NULL,
  status public.record_status NOT NULL DEFAULT 'pending',
  verification_method public.verification_method NOT NULL DEFAULT 'photo',
  notes TEXT,
  validated_by UUID,
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_validations_target ON public.validations(target_type, target_id);

ALTER TABLE public.validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Validations viewable by all authenticated"
  ON public.validations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Moderators insert validations"
  ON public.validations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin'))
  );

CREATE POLICY "Moderators update validations"
  ON public.validations FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin'))
  );

-- INCENTIVE ITEMS
CREATE TABLE IF NOT EXISTS public.incentive_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  points_cost INTEGER NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT true,
  stock INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.incentive_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Incentives viewable by all authenticated"
  ON public.incentive_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage incentives insert"
  ON public.incentive_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins manage incentives update"
  ON public.incentive_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins manage incentives delete"
  ON public.incentive_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'));

CREATE TRIGGER trg_incentive_items_updated
  BEFORE UPDATE ON public.incentive_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NEGOTIATIONS
CREATE TABLE IF NOT EXISTS public.negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  status public.negotiation_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_negotiations_buyer ON public.negotiations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_seller ON public.negotiations(seller_id);

ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_negotiation_participant(_neg uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.negotiations n WHERE n.id = _neg AND (n.buyer_id = _user OR n.seller_id = _user));
$$;

CREATE POLICY "Negotiations view participants"
  ON public.negotiations FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Negotiations insert buyer"
  ON public.negotiations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Negotiations update participants"
  ON public.negotiations FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE TRIGGER trg_negotiations_updated
  BEFORE UPDATE ON public.negotiations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NEGOTIATION MESSAGES
CREATE TABLE IF NOT EXISTS public.negotiation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id UUID NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_neg_messages_negotiation ON public.negotiation_messages(negotiation_id);

ALTER TABLE public.negotiation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Neg messages view participants"
  ON public.negotiation_messages FOR SELECT TO authenticated
  USING (public.is_negotiation_participant(negotiation_id, auth.uid()));

CREATE POLICY "Neg messages send participants"
  ON public.negotiation_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.is_negotiation_participant(negotiation_id, auth.uid()));

-- POINTS LEDGER
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_type public.points_source NOT NULL,
  source_id UUID,
  points_delta INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON public.points_ledger(user_id, created_at DESC);

ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ledger view own"
  ON public.points_ledger FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Ledger insert own or system"
  ON public.points_ledger FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- TRIGGERS DE updated_at em tabelas que ainda não têm
-- =========================================================
DROP TRIGGER IF EXISTS trg_species_updated ON public.species;
CREATE TRIGGER trg_species_updated
  BEFORE UPDATE ON public.species
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_negotiations_updated_at ON public.negotiations;

-- =========================================================
-- SEEDS — espécies nativas + itens de incentivo
-- =========================================================
INSERT INTO public.species (common_name, scientific_name, slug, base_points, is_custom)
VALUES
  ('Ipê-amarelo', 'Handroanthus albus', 'ipe-amarelo', 15, false),
  ('Pau-brasil', 'Paubrasilia echinata', 'pau-brasil', 25, false),
  ('Jatobá', 'Hymenaea courbaril', 'jatoba', 20, false),
  ('Açaí', 'Euterpe oleracea', 'acai', 12, false),
  ('Castanheira', 'Bertholletia excelsa', 'castanheira', 30, false),
  ('Cacau', 'Theobroma cacao', 'cacau', 18, false),
  ('Cupuaçu', 'Theobroma grandiflorum', 'cupuacu', 18, false),
  ('Andiroba', 'Carapa guianensis', 'andiroba', 22, false),
  ('Mogno', 'Swietenia macrophylla', 'mogno', 28, false),
  ('Seringueira', 'Hevea brasiliensis', 'seringueira', 20, false)
ON CONFLICT DO NOTHING;

INSERT INTO public.incentive_items (name, description, category, points_cost, stock, available)
VALUES
  ('Kit de mudas nativas', 'Kit com 10 mudas de espécies da Amazônia', 'insumo', 200, 25, true),
  ('Curso de SAF online', 'Acesso a curso completo de Sistemas Agroflorestais', 'educacao', 500, 100, true),
  ('Adubo orgânico 20kg', 'Saca de adubo orgânico para plantio', 'insumo', 150, 40, true),
  ('Camiseta SAF MarketLink', 'Camiseta oficial do programa', 'brinde', 80, 60, true),
  ('Consultoria técnica 1h', 'Sessão de consultoria com agrônomo', 'servico', 350, 20, true),
  ('Diagnóstico de solo', 'Análise laboratorial de amostra de solo', 'servico', 600, 15, true)
ON CONFLICT DO NOTHING;