import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Advantages from './components/Advantages';
import VideoGallery from './components/VideoGallery';
import Coverage from './components/Coverage';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Reservas from './components/Reservas';

// ── Supabase client ───────────────────────────────────────────────────────────
const supabase = createClient(
  "https://pyloifgprupypgkhkqmx.supabase.co",
  "sb_publishable_UN__-qAOLiEli5p9xY9ypQ_Qr9wxajL"
);

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Sesión activa al cargar la página
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Escuchar login / logout en tiempo real
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Formatear el usuario para pasarlo al Header
  const userProp = user ? {
    name:  user.user_metadata?.full_name ?? user.email.split("@")[0],
    email: user.email,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-50">

      <Header user={userProp} />

      <main style={{ paddingTop: '64px' }}>
        <Reservas />
        <Hero />
        <Services />
        <Advantages />
        <VideoGallery />
        <Coverage />
        <Contact />
        <Footer />
      </main>

      <WhatsAppButton />

    </div>
  );
};

export default App;