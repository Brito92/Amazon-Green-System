
DROP POLICY IF EXISTS "Media read own or via direct url" ON storage.objects;
DROP POLICY IF EXISTS "Media public read" ON storage.objects;

CREATE POLICY "Media list own only"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
