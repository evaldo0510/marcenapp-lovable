
-- Add share_token column for public sharing
ALTER TABLE public.renders ADD COLUMN share_token TEXT UNIQUE DEFAULT NULL;

-- Allow public (anon) access to renders via share_token
CREATE POLICY "Anyone can view shared renders"
ON public.renders
FOR SELECT
USING (share_token IS NOT NULL);
