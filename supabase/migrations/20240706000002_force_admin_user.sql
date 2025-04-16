-- Force create admin user in auth.users table with a known password hash
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin@genbi.com', '$2a$10$Ht9QyYDgkLNvVvKPSWXRTuQJfP1ZGWVnJDQJMQMVMfQJNYJ3JK5Uu', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User"}', now(), now())
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

-- Ensure admin user exists in public.users table
INSERT INTO public.users (id, email, name, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin@genbi.com', 'Admin User', now(), now())
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = now();

-- Ensure admin user exists in admin_users table
INSERT INTO public.admin_users (id, email, name, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin@genbi.com', 'Admin User', now(), now())
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = now();
