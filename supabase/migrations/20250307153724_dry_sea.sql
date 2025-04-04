/*
  # Add RLS policies for articles and categories

  1. Security Changes
    - Enable RLS on articles and categories tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access
    
  2. Changes
    - Add RLS policies for CRUD operations with existence checks
    - Ensure no duplicate policies are created
*/

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop article policies
    DROP POLICY IF EXISTS "Anyone can read articles" ON articles;
    DROP POLICY IF EXISTS "Authenticated users can create articles" ON articles;
    DROP POLICY IF EXISTS "Users can update their own articles" ON articles;
    DROP POLICY IF EXISTS "Users can delete their own articles" ON articles;
    
    -- Drop category policies
    DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
    DROP POLICY IF EXISTS "Authenticated users can create categories" ON categories;
    DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
    DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
END $$;

-- Add RLS policies for articles
CREATE POLICY "Anyone can read articles"
  ON articles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create articles"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own articles"
  ON articles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own articles"
  ON articles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add RLS policies for categories
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);