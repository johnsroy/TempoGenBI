-- First check if admin user exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@genbi.com') THEN
    -- Create admin user if it doesn't exist
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'admin@genbi.com',
      crypt('test12345', gen_salt('bf')),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin User"}'::jsonb,
      now(),
      now(),
      'authenticated'
    );

    -- Create corresponding entry in public.users table
    INSERT INTO public.users (
      id,
      email,
      name,
      is_admin,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'admin@genbi.com',
      'Admin User',
      true,
      now(),
      now()
    );
  ELSE
    -- Update existing admin user's password
    UPDATE auth.users
    SET 
      encrypted_password = crypt('test12345', gen_salt('bf')),
      email_confirmed_at = now(),
      updated_at = now()
    WHERE email = 'admin@genbi.com';
    
    -- Ensure admin flag is set in public.users
    UPDATE public.users
    SET is_admin = true
    WHERE email = 'admin@genbi.com';
  END IF;
END
$$;