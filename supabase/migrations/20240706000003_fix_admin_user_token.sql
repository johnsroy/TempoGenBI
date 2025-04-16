-- Create admin user with all required fields
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, is_super_admin, phone, phone_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change, confirmation_sent_at, recovery_sent_at, email_change_token_current, email_change_sent_at, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, instance_id, token_identifier)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin@genbi.com', '$2a$10$Ht9QyYDgkLNvVvKPSWXRTuQJfP1ZGWVnJDQJMQMVMfQJNYJ3JK5Uu', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User"}', now(), now(), 'authenticated', false, NULL, NULL, '', '', '', '', NULL, NULL, '', NULL, NULL, '', NULL, false, NULL, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now(),
  token_identifier = EXCLUDED.token_identifier;

-- Ensure admin user exists in public.users table
INSERT INTO public.users (id, email, name, created_at, updated_at, token_identifier)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin@genbi.com', 'Admin User', now(), now(), '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = now(),
  token_identifier = EXCLUDED.token_identifier;

-- Ensure admin user exists in admin_users table
INSERT INTO public.admin_users (id, email, name, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin@genbi.com', 'Admin User', now(), now())
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = now();
