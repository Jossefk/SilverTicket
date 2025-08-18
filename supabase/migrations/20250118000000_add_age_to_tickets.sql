/*
  # Add age column to tickets table

  1. Changes
    - Add `age` column to `tickets` table
    - Set default value for existing records
*/

-- Add age column to tickets table
ALTER TABLE tickets ADD COLUMN age integer;

-- Set a default age for existing tickets (optional, can be NULL)
UPDATE tickets SET age = 25 WHERE age IS NULL;

-- Make age column NOT NULL for future inserts
ALTER TABLE tickets ALTER COLUMN age SET NOT NULL;

-- Add check constraint to ensure reasonable age values
ALTER TABLE tickets ADD CONSTRAINT tickets_age_check CHECK (age >= 0 AND age <= 120);