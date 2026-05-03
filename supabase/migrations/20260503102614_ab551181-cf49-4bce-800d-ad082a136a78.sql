
-- Create trigger for auto-creating profiles on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure admin_settings has at least one row
INSERT INTO public.admin_settings (whatsapp_number, admin_email, business_name)
SELECT '', 'admin@gmail.com', 'Marine Engines Pro'
WHERE NOT EXISTS (SELECT 1 FROM public.admin_settings);
