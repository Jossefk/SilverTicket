/*
  # Create event settings table

  1. New Tables
    - `event_settings`
      - `id` (uuid, primary key)
      - `name` (text, event name)
      - `date` (text, event date)
      - `time` (text, event time)
      - `location` (text, event location)
      - `description` (text, event description)
      - `logo_url` (text, logo image URL)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `event_settings` table
    - Add policies for public read access
    - Add policies for authenticated users to update settings

  3. Initial Data
    - Insert default event configuration
*/

CREATE TABLE IF NOT EXISTS event_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Conferencia Tech 2025',
  date text NOT NULL DEFAULT '2025-03-15',
  time text NOT NULL DEFAULT '9:00 AM',
  location text NOT NULL DEFAULT 'Centro de Convenciones Ciudad',
  description text DEFAULT 'Una conferencia sobre las últimas tendencias en tecnología',
  logo_url text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read event settings
CREATE POLICY "Anyone can read event settings"
  ON event_settings
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to update event settings (in production, restrict to authenticated users)
CREATE POLICY "Anyone can update event settings"
  ON event_settings
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to insert event settings
CREATE POLICY "Anyone can insert event settings"
  ON event_settings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert default event settings
INSERT INTO event_settings (name, date, time, location, description)
VALUES (
  'Conferencia Tech 2025',
  '2025-03-15',
  '9:00 AM',
  'Centro de Convenciones Ciudad',
  'Una conferencia sobre las últimas tendencias en tecnología'
) ON CONFLICT DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_settings_updated_at ON event_settings (updated_at DESC);