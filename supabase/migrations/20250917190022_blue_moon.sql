/*
  # Add notes field to quotes table

  1. Changes
    - Add `notes` column to `quotes` table for admin observations
    - Column is optional (nullable) and stores text

  2. Security
    - No changes to RLS policies needed
    - Notes are visible to all users who can see the quote
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'notes'
  ) THEN
    ALTER TABLE quotes ADD COLUMN notes text;
  END IF;
END $$;