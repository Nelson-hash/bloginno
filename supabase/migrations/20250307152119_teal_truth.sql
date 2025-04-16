/*
  # Set up admin users and roles

  1. Changes
    - Create admin role in auth schema
    - Set up RLS policies for admin users
    - Add admin column to auth.users
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add admin column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'auth'
    AND table_name = 'users'
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE auth.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create policy to allow admin users to manage all content
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage all articles"
ON public.articles
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  (SELECT is_admin FROM auth.users WHERE id = auth.uid())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage all categories"
ON public.categories
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  (SELECT is_admin FROM auth.users WHERE id = auth.uid())
);

-- Function to set user as admin
CREATE OR REPLACE FUNCTION auth.make_user_admin(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET is_admin = true
  WHERE email = user_email;
END;
$$;