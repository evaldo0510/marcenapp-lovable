
-- Fix projects RLS: restrict to owner and add DELETE
DROP POLICY IF EXISTS "Anyone can insert" ON public.projects;
DROP POLICY IF EXISTS "Anyone can update status" ON public.projects;
DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON public.projects;

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for render_feedback
ALTER PUBLICATION supabase_realtime ADD TABLE public.render_feedback;
