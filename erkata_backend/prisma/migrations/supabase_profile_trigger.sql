-- 1. Ensure enums exist in public schema
DO $$ BEGIN
  CREATE TYPE public."UserRole" AS ENUM ('super_admin', 'admin', 'operator', 'agent', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public."Tier" AS ENUM ('FREE', 'PEACE', 'LOVE', 'UNITY', 'ABUNDANT_LIFE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, tier)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    (COALESCE(NEW.raw_user_meta_data->>'role', 'customer'))::public."UserRole",
    (COALESCE(NEW.raw_user_meta_data->>'tier', 'FREE'))::public."Tier"
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
