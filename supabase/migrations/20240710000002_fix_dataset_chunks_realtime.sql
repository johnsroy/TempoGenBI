-- Check if dataset_chunks is already in the publication before adding it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'dataset_chunks'
  ) THEN
    alter publication supabase_realtime add table dataset_chunks;
  END IF;
END $$;
