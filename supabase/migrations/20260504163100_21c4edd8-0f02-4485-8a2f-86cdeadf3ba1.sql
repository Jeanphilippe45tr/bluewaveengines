
-- Allow admins to view all chat messages
CREATE POLICY "Admins can view all messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to send messages to anyone
CREATE POLICY "Admins can send messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()) AND auth.uid() = sender_id);

-- Recreate trigger for new user profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
