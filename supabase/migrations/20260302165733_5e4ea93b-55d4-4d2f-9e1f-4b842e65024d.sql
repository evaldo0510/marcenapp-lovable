
-- Create renders table to store gallery images
CREATE TABLE public.renders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.renders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own renders
CREATE POLICY "Users can view own renders" ON public.renders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own renders
CREATE POLICY "Users can insert own renders" ON public.renders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own renders
CREATE POLICY "Users can delete own renders" ON public.renders
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
