-- BetterDev members — core profile + onboarding (extend with ALTER TABLE as you evolve)

CREATE SEQUENCE IF NOT EXISTS members_member_number_seq START 1;

CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  member_number INTEGER NOT NULL UNIQUE DEFAULT nextval('members_member_number_seq'),
  community_id TEXT GENERATED ALWAYS AS ('DEV-' || lpad(member_number::text, 4, '0')) STORED UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT,
  x_handle TEXT NOT NULL,
  x_profile_link TEXT,
  reputation INTEGER NOT NULL DEFAULT 0 CHECK (reputation >= 0),
  followed_x BOOLEAN NOT NULL DEFAULT false,
  joined_community BOOLEAN NOT NULL DEFAULT false,
  invite_slug TEXT NOT NULL UNIQUE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  avatar_url TEXT,
  bio TEXT,
  screenshot_file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS members_email_lower_idx ON public.members (lower(email));

CREATE OR REPLACE FUNCTION public.members_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS members_updated_at ON public.members;
CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.members_touch_updated_at();

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_insert_signup"
  ON public.members
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth_user_id IS NULL OR auth_user_id = auth.uid());

CREATE POLICY "members_select_own"
  ON public.members
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "members_update_own"
  ON public.members
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());
