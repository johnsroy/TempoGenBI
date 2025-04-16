-- Create a function to handle admin user creation in public tables
CREATE OR REPLACE FUNCTION create_admin_user_entries(admin_id UUID, admin_email TEXT, admin_name TEXT)
RETURNS VOID AS $$
BEGIN
  -- Ensure admin user exists in public.users table
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES 
    (admin_id, admin_email, admin_name, now(), now())
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = now();

  -- Ensure admin user exists in admin_users table
  INSERT INTO public.admin_users (id, email, name, created_at, updated_at)
  VALUES 
    (admin_id, admin_email, admin_name, now(), now())
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = now();

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
