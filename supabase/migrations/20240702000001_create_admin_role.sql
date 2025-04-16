-- Create admin role in the users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  SELECT u.is_admin INTO is_admin_user FROM public.users u WHERE u.id = user_id;
  RETURN COALESCE(is_admin_user, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin user
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, role, is_super_admin)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin@genbi.com', now(), now(), now(), 'authenticated', true)
ON CONFLICT (id) DO NOTHING;

-- Add admin user to public.users table
INSERT INTO public.users (id, user_id, email, name, is_admin, created_at, token_identifier)
VALUES 
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'admin@genbi.com', 'Admin User', true, now(), '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Create a dummy subscription for the admin user
INSERT INTO public.subscriptions (id, user_id, status, price_id, customer_id, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'active', 'admin_plan', 'admin_customer', now())
ON CONFLICT (id) DO NOTHING;
