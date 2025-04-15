CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_type TEXT,
  columns JSONB,
  sample_data JSONB,
  row_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visualizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  query TEXT,
  chart_type TEXT NOT NULL,
  chart_config JSONB NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  visualization_id UUID REFERENCES visualizations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for all tables
alter publication supabase_realtime add table datasets;
alter publication supabase_realtime add table visualizations;
alter publication supabase_realtime add table saved_queries;

-- Create policies for datasets
DROP POLICY IF EXISTS "Users can view their own datasets" ON datasets;
CREATE POLICY "Users can view their own datasets"
  ON datasets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own datasets" ON datasets;
CREATE POLICY "Users can insert their own datasets"
  ON datasets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own datasets" ON datasets;
CREATE POLICY "Users can update their own datasets"
  ON datasets FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own datasets" ON datasets;
CREATE POLICY "Users can delete their own datasets"
  ON datasets FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for visualizations
DROP POLICY IF EXISTS "Users can view their own visualizations" ON visualizations;
CREATE POLICY "Users can view their own visualizations"
  ON visualizations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own visualizations" ON visualizations;
CREATE POLICY "Users can insert their own visualizations"
  ON visualizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own visualizations" ON visualizations;
CREATE POLICY "Users can update their own visualizations"
  ON visualizations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own visualizations" ON visualizations;
CREATE POLICY "Users can delete their own visualizations"
  ON visualizations FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for saved_queries
DROP POLICY IF EXISTS "Users can view their own saved_queries" ON saved_queries;
CREATE POLICY "Users can view their own saved_queries"
  ON saved_queries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved_queries" ON saved_queries;
CREATE POLICY "Users can insert their own saved_queries"
  ON saved_queries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved_queries" ON saved_queries;
CREATE POLICY "Users can delete their own saved_queries"
  ON saved_queries FOR DELETE
  USING (auth.uid() = user_id);