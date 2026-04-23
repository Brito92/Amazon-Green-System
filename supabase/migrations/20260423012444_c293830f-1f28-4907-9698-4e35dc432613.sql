
DO $$ BEGIN CREATE TYPE public.record_status AS ENUM ('pending','verified','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.verification_method AS ENUM ('photo','time','hybrid'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.product_kind AS ENUM ('sale','incentive'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.product_origin AS ENUM ('verified_planting','rural_other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Produtor(a)',
  city TEXT, state TEXT, avatar_url TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.species (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS species_common_name_unique ON public.species (lower(common_name));
ALTER TABLE public.species ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Species viewable by authenticated" ON public.species;
DROP POLICY IF EXISTS "Authenticated add species" ON public.species;
CREATE POLICY "Species viewable by authenticated" ON public.species FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated add species" ON public.species FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE TABLE IF NOT EXISTS public.consortia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  area_hectares NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT, photo_url TEXT,
  species_list TEXT[] NOT NULL DEFAULT '{}',
  status public.record_status NOT NULL DEFAULT 'pending',
  verification_method public.verification_method NOT NULL DEFAULT 'hybrid',
  points INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consortia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Consortia view all auth" ON public.consortia;
DROP POLICY IF EXISTS "Insert own consortia" ON public.consortia;
DROP POLICY IF EXISTS "Update own consortia" ON public.consortia;
DROP POLICY IF EXISTS "Delete own consortia" ON public.consortia;
CREATE POLICY "Consortia view all auth" ON public.consortia FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own consortia" ON public.consortia FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own consortia" ON public.consortia FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Delete own consortia" ON public.consortia FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.plantings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  species_id UUID REFERENCES public.species(id) ON DELETE SET NULL,
  consortium_id UUID REFERENCES public.consortia(id) ON DELETE SET NULL,
  planted_at DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT, notes TEXT,
  status public.record_status NOT NULL DEFAULT 'pending',
  verification_method public.verification_method NOT NULL DEFAULT 'photo',
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plantings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Plantings view all auth" ON public.plantings;
DROP POLICY IF EXISTS "Insert own plantings" ON public.plantings;
DROP POLICY IF EXISTS "Update own plantings" ON public.plantings;
DROP POLICY IF EXISTS "Delete own plantings" ON public.plantings;
CREATE POLICY "Plantings view all auth" ON public.plantings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own plantings" ON public.plantings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own plantings" ON public.plantings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Delete own plantings" ON public.plantings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS plantings_user_idx ON public.plantings(user_id);
CREATE INDEX IF NOT EXISTS plantings_consortium_idx ON public.plantings(consortium_id);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.product_kind NOT NULL DEFAULT 'sale',
  origin public.product_origin NOT NULL DEFAULT 'rural_other',
  name TEXT NOT NULL, description TEXT, contact TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_brl NUMERIC(10,2),
  price_points INTEGER,
  blockchain_verified BOOLEAN NOT NULL DEFAULT false,
  sustainable_impact TEXT,
  source_planting_id UUID REFERENCES public.plantings(id) ON DELETE SET NULL,
  source_consortium_id UUID REFERENCES public.consortia(id) ON DELETE SET NULL,
  photo_url TEXT,
  status public.record_status NOT NULL DEFAULT 'verified',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products view all auth" ON public.products;
DROP POLICY IF EXISTS "Insert own products" ON public.products;
DROP POLICY IF EXISTS "Update own products" ON public.products;
DROP POLICY IF EXISTS "Delete own products" ON public.products;
CREATE POLICY "Products view all auth" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own products" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Update own products" ON public.products FOR UPDATE TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Delete own products" ON public.products FOR DELETE TO authenticated USING (auth.uid() = seller_id);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Cart select own" ON public.cart_items;
DROP POLICY IF EXISTS "Cart insert own" ON public.cart_items;
DROP POLICY IF EXISTS "Cart update own" ON public.cart_items;
DROP POLICY IF EXISTS "Cart delete own" ON public.cart_items;
CREATE POLICY "Cart select own" ON public.cart_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Cart insert own" ON public.cart_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cart update own" ON public.cart_items FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Cart delete own" ON public.cart_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(buyer_id, seller_id, product_id)
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Conv view participants" ON public.conversations;
DROP POLICY IF EXISTS "Conv insert buyer" ON public.conversations;
DROP POLICY IF EXISTS "Conv update participants" ON public.conversations;
CREATE POLICY "Conv view participants" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Conv insert buyer" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Conv update participants" ON public.conversations FOR UPDATE TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conv UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = _conv AND (c.buyer_id = _user OR c.seller_id = _user));
$$;

DROP POLICY IF EXISTS "Msg view participants" ON public.messages;
DROP POLICY IF EXISTS "Msg send participants" ON public.messages;
CREATE POLICY "Msg view participants" ON public.messages FOR SELECT TO authenticated USING (public.is_conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "Msg send participants" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND public.is_conversation_participant(conversation_id, auth.uid()));
CREATE INDEX IF NOT EXISTS messages_conv_idx ON public.messages(conversation_id, created_at);

ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_consortia_updated ON public.consortia;
CREATE TRIGGER trg_consortia_updated BEFORE UPDATE ON public.consortia FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_plantings_updated ON public.plantings;
CREATE TRIGGER trg_plantings_updated BEFORE UPDATE ON public.plantings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, city, state)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state');
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.recalculate_points(_user UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE total INTEGER;
BEGIN
  SELECT COALESCE(SUM(points), 0) INTO total FROM (
    SELECT points FROM public.plantings WHERE user_id = _user AND status = 'verified'
    UNION ALL
    SELECT points FROM public.consortia WHERE user_id = _user AND status = 'verified'
  ) s;
  UPDATE public.profiles SET points = total WHERE user_id = _user;
END; $$;

CREATE OR REPLACE FUNCTION public.trg_recalc_points()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recalculate_points(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END; $$;
DROP TRIGGER IF EXISTS trg_plantings_points ON public.plantings;
CREATE TRIGGER trg_plantings_points AFTER INSERT OR UPDATE OR DELETE ON public.plantings FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_points();
DROP TRIGGER IF EXISTS trg_consortia_points ON public.consortia;
CREATE TRIGGER trg_consortia_points AFTER INSERT OR UPDATE OR DELETE ON public.consortia FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_points();

INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Media public read" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload media" ON storage.objects;
DROP POLICY IF EXISTS "Update own media" ON storage.objects;
DROP POLICY IF EXISTS "Delete own media" ON storage.objects;
CREATE POLICY "Media public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Auth upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Update own media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Delete own media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

INSERT INTO public.species (common_name, scientific_name) VALUES
  ('Açaí', 'Euterpe oleracea'),
  ('Castanheira', 'Bertholletia excelsa'),
  ('Cupuaçu', 'Theobroma grandiflorum'),
  ('Cacau', 'Theobroma cacao'),
  ('Andiroba', 'Carapa guianensis'),
  ('Mogno', 'Swietenia macrophylla'),
  ('Buriti', 'Mauritia flexuosa'),
  ('Pupunha', 'Bactris gasipaes'),
  ('Ipê-amarelo', 'Handroanthus albus'),
  ('Jatobá', 'Hymenaea courbaril')
ON CONFLICT DO NOTHING;
