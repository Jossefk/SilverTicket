/*
  # Create storage bucket for event assets

  1. Storage
    - Create `event-assets` bucket for storing event logos
    - Set bucket to be public for easy access to logos
    - Add policy to allow public uploads and reads

  2. Security
    - Enable public access for reading uploaded logos
    - Allow public uploads (can be restricted later if needed)
*/

-- Create the storage bucket for event assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-assets',
  'event-assets', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public uploads to event-assets bucket
CREATE POLICY "Allow public uploads to event-assets"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'event-assets');

-- Create policy to allow public reads from event-assets bucket
CREATE POLICY "Allow public reads from event-assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'event-assets');

-- Create policy to allow public updates to event-assets bucket
CREATE POLICY "Allow public updates to event-assets"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'event-assets');

-- Create policy to allow public deletes from event-assets bucket
CREATE POLICY "Allow public deletes from event-assets"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'event-assets');