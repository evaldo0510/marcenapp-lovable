import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './integrations/supabase/client';
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import ResetPassword from './pages/ResetPassword';
import SharedRender from './pages/SharedRender';

function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={session ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/share/:token" element={<SharedRender />} />
        <Route path="/" element={session ? <Index /> : <Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
