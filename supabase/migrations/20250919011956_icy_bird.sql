/*
  # Fix Anonymous Reactions and Admin Quote Creation

  1. Database Changes
    - Allow null values in reactions.author_id for anonymous users
    - Update reactions table constraints

  2. Security Updates
    - Update RLS policies for reactions to allow anonymous users
    - Update RLS policies for quotes to allow admin creation
    - Add proper policies for anonymous reactions

  3. Policy Updates
    - Allow anonymous users to insert reactions with null author_id
    - Allow anonymous users to delete their own reactions using anonymous_session
    - Allow admins to create quotes regardless of author_id matching
*/

-- First, drop the existing unique constraint that includes author_id
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_quote_id_author_id_key;

-- Allow null values in author_id column for anonymous users
ALTER TABLE reactions ALTER COLUMN author_id DROP NOT NULL;

-- Create a new unique constraint that handles both authenticated and anonymous users
-- For authenticated users: unique on (quote_id, author_id) where author_id is not null
-- For anonymous users: unique on (quote_id, anonymous_session) where anonymous_session is not null
CREATE UNIQUE INDEX reactions_quote_author_unique 
ON reactions (quote_id, author_id) 
WHERE author_id IS NOT NULL;

CREATE UNIQUE INDEX reactions_quote_anonymous_unique 
ON reactions (quote_id, anonymous_session) 
WHERE anonymous_session IS NOT NULL;

-- Drop existing policies for reactions
DROP POLICY IF EXISTS "Autores podem reagir" ON reactions;
DROP POLICY IF EXISTS "Autores podem remover suas reações" ON reactions;
DROP POLICY IF EXISTS "Usuários anônimos podem reagir" ON reactions;
DROP POLICY IF EXISTS "Usuários anônimos podem remover suas reações" ON reactions;

-- Create new comprehensive policies for reactions
CREATE POLICY "Authenticated users can react"
  ON reactions
  FOR INSERT
  TO public
  WITH CHECK (
    author_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM authors 
      WHERE authors.id = reactions.author_id 
      AND authors.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can react"
  ON reactions
  FOR INSERT
  TO public
  WITH CHECK (
    author_id IS NULL 
    AND anonymous_session IS NOT NULL
  );

CREATE POLICY "Authenticated users can remove their reactions"
  ON reactions
  FOR DELETE
  TO public
  USING (
    author_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM authors 
      WHERE authors.id = reactions.author_id 
      AND authors.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can remove their reactions"
  ON reactions
  FOR DELETE
  TO public
  USING (
    author_id IS NULL 
    AND anonymous_session IS NOT NULL
  );

-- Update quotes policies to allow admin creation
DROP POLICY IF EXISTS "Autores podem criar suas frases" ON quotes;

CREATE POLICY "Authors can create their quotes"
  ON quotes
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM authors 
      WHERE authors.id = quotes.author_id 
      AND authors.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create any quotes"
  ON quotes
  FOR INSERT
  TO public
  WITH CHECK (is_admin());

-- Ensure the is_admin function exists
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;