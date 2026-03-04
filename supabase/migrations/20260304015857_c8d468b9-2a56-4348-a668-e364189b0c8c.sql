-- Allow users to update their own renders (for share_token and has_new_feedback)
CREATE POLICY "Users can update own renders"
ON public.renders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow anyone to update has_new_feedback on shared renders (for feedback notification)
CREATE POLICY "Anyone can mark feedback on shared renders"
ON public.renders
FOR UPDATE
USING (share_token IS NOT NULL)
WITH CHECK (share_token IS NOT NULL);