
-- Drop the broad select policy on storage and replace with path-based
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (
  bucket_id = 'product-images' AND (storage.foldername(name))[1] IS NOT NULL
);

-- Insert default admin settings
INSERT INTO public.admin_settings (whatsapp_number, admin_email, business_name, currency, about_text)
VALUES ('+1234567890', 'admin@gmail.com', 'Marine Engines Pro', 'USD', 'Premium outboard engines for all your marine needs.');
