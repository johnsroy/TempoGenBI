-- Create a separate admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_users table that allows admins to read all records
DROP POLICY IF EXISTS "Admins can read all admin_users" ON public.admin_users;
CREATE POLICY "Admins can read all admin_users"
  ON public.admin_users
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Create policy for admin_users table that allows admins to update their own record
DROP POLICY IF EXISTS "Admins can update their own record" ON public.admin_users;
CREATE POLICY "Admins can update their own record"
  ON public.admin_users
  FOR UPDATE
  USING (auth.uid() = id);

-- Re-enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users table that allows users to read their own record
DROP POLICY IF EXISTS "Users can read their own record" ON public.users;
CREATE POLICY "Users can read their own record"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM public.admin_users));

-- Create policy for users table that allows users to update their own record
DROP POLICY IF EXISTS "Users can update their own record" ON public.users;
CREATE POLICY "Users can update their own record"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM public.admin_users));

-- Create policy for users table that allows admins to read all records
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Insert admin user into admin_users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE email = 'admin@genbi.com') THEN
    INSERT INTO public.admin_users (id, email, name, created_at, updated_at)
    SELECT id, email, 'Admin User', now(), now()
    FROM auth.users
    WHERE email = 'admin@genbi.com';
  END IF;
END
$$;