
CREATE TABLE public.floor_renders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  floor_id INTEGER NOT NULL,
  render_id UUID REFERENCES public.renders(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  label TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.floor_renders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own floor renders"
  ON public.floor_renders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
