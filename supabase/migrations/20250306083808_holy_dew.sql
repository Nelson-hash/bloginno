/*
  # Create tables and set up RLS policies

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `summary` (text)
      - `content` (text)
      - `date` (text)
      - `read_time` (text)
      - `image_url` (text)
      - `video_url` (text, nullable)
      - `category` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `categories`
      - `id` (text, primary key)
      - `name` (text)
      - `icon` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all records
      - Create/Update/Delete their own records
*/

-- Create articles table if it doesn't exist
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  content text NOT NULL,
  date text NOT NULL,
  read_time text NOT NULL,
  image_url text NOT NULL,
  video_url text,
  category text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can read articles" ON articles;
    DROP POLICY IF EXISTS "Authenticated users can create articles" ON articles;
    DROP POLICY IF EXISTS "Users can update their own articles" ON articles;
    DROP POLICY IF EXISTS "Users can delete their own articles" ON articles;
END $$;

-- Create policies for articles
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

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
    DROP POLICY IF EXISTS "Authenticated users can create categories" ON categories;
    DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
    DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
END $$;

-- Create policies for categories
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