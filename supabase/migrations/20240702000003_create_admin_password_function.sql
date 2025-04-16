-- Create a function to set the admin password
CREATE OR REPLACE FUNCTION admin_set_password(admin_email TEXT, new_password TEXT)
RETURNS VOID AS $$
BEGIN
  -- Update the user's password directly in the auth.users table
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE email = admin_email;
  
  -- Also update the raw_user_meta_data to indicate password was set
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{password_set}', 'true')
  WHERE email = admin_email;
  
  -- Ensure the user is confirmed
  UPDATE auth.users
  SET confirmed_at = CURRENT_TIMESTAMP
  WHERE email = admin_email AND confirmed_at IS NULL;
  
  -- Ensure the user has email confirmed
  UPDATE auth.users
  SET email_confirmed_at = CURRENT_TIMESTAMP
  WHERE email = admin_email AND email_confirmed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION admin_set_password TO service_role;