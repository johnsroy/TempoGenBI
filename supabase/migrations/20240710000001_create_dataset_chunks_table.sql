-- Create a table to store dataset chunks for large file uploads
CREATE TABLE IF NOT EXISTS dataset_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed BOOLEAN DEFAULT FALSE
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_dataset_chunks_session_id ON dataset_chunks(session_id);
CREATE INDEX IF NOT EXISTS idx_dataset_chunks_user_id ON dataset_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_dataset_chunks_chunk_index ON dataset_chunks(chunk_index);

-- Add session_id column to datasets table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'datasets' AND column_name = 'session_id') THEN
    ALTER TABLE datasets ADD COLUMN session_id TEXT;
  END IF;
END $$;

-- Enable realtime for dataset_chunks
alter publication supabase_realtime add table dataset_chunks;
