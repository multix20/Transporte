import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Fleet from './components/Fleet';
import Advantages from './components/Advantages';
import VideoGallery from './components/VideoGallery';
import Coverage from './components/Coverage';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

const App = () => (
  <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-50">
    <Header />
    <Hero />
    <Services />
    <Fleet />
    <Advantages />
    <VideoGallery />
    <Coverage />
    <Contact />
    <Footer />
    <WhatsAppButton />
  </div>
);

export default App;