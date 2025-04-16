-- Create SMTP configuration table
CREATE TABLE IF NOT EXISTS public.smtp_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  password TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable row-level security
ALTER TABLE public.smtp_config ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users only
CREATE POLICY "Admin users can manage SMTP config"
  ON public.smtp_config
  USING (public.is_admin(auth.uid()));

-- Create policy for reading SMTP config
CREATE POLICY "Anyone can read active SMTP config"
  ON public.smtp_config
  FOR SELECT
  USING (is_active = true);

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE public.smtp_config;
