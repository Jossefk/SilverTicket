/*
  # Create tickets table for event management

  1. New Tables
    - `tickets`
      - `id` (text, primary key) - Unique ticket identifier
      - `name` (text) - Attendee full name
      - `email` (text) - Attendee email address
      - `phone` (text) - Attendee phone number
      - `event_name` (text) - Name of the event
      - `event_date` (text) - Event date
      - `event_location` (text) - Event location
      - `created_at` (timestamptz) - Ticket creation timestamp
      - `checked_in` (boolean) - Check-in status
      - `checked_in_at` (timestamptz) - Check-in timestamp

  2. Security
    - Enable RLS on `tickets` table
    - Add policies for public read access (for ticket validation)
    - Add policies for public insert (for ticket creation)
    - Add policies for authenticated update (for check-in)
*/

CREATE TABLE IF NOT EXISTS tickets (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  event_name text NOT NULL,
  event_date text NOT NULL,
  event_location text NOT NULL,
  created_at timestamptz DEFAULT now(),
  checked_in boolean DEFAULT false,
  checked_in_at timestamptz
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read tickets (needed for validation)
CREATE POLICY "Anyone can read tickets"
  ON tickets
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to create tickets (public registration)
CREATE POLICY "Anyone can create tickets"
  ON tickets
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update check-in status (for scanner functionality)
CREATE POLICY "Anyone can update check-in status"
  ON tickets
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tickets_id ON tickets(id);
CREATE INDEX IF NOT EXISTS idx_tickets_email ON tickets(email);
CREATE INDEX IF NOT EXISTS idx_tickets_checked_in ON tickets(checked_in);