
-- Create feedback table for shared render feedback
CREATE TABLE public.render_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  render_id UUID NOT NULL REFERENCES public.renders(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'comment', -- 'approved', 'revision', 'comment'
  client_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.render_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback (public link, no auth required)
CREATE POLICY "Anyone can insert feedback on shared renders"
ON public.render_feedback
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.renders WHERE id = render_id AND share_token IS NOT NULL)
);

-- Owner can view feedback on their renders
CREATE POLICY "Owners can view feedback on their renders"
ON public.render_feedback
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.renders WHERE id = render_id AND user_id = auth.uid())
);

-- Add notification_seen column to renders to track unread feedback
ALTER TABLE public.renders ADD COLUMN has_new_feedback BOOLEAN NOT NULL DEFAULT false;
