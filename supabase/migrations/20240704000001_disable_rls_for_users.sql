-- Disable RLS for users table to allow admin creation
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.users;
CREATE POLICY "Allow all operations for authenticated users"
  ON public.users
  USING (true);
