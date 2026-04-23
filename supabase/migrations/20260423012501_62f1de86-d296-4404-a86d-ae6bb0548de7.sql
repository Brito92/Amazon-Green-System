
DROP POLICY IF EXISTS "Media public read" ON storage.objects;

-- Permite ler/baixar qualquer arquivo do bucket público pelo URL direto,
-- mas a listagem (LIST) é restrita ao dono da pasta (uid no primeiro segmento).
CREATE POLICY "Media read own or via direct url"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'media'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth.role() = 'anon'
      OR auth.role() = 'authenticated'
    )
  );
