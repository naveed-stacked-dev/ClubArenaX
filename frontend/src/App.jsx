import React, { useState, useEffect } from 'react';
import { useScroll } from 'framer-motion';

import Navbar from './Home/components/Navbar';
import Footer from './Home/components/Footer';
import FloatingBall from './Home/components/FloatingBall';

import Hero from './Home/sections/Hero';
import Products from './Home/sections/Products';
import Analytics from './Home/sections/Analytics';
import About from './Home/sections/About';
import Reviews from './Home/sections/Reviews';
import Clients from './Home/sections/Clients';
import Contact from './Home/sections/Contact';

export default function App() {
  const { scrollYProgress } = useScroll();
  const [ballProgress, setBallProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Track mobile for disabling heavy 3D stuff
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Subscribe to scrollYProgress and pass as number to FloatingBall
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => setBallProgress(v));
    return unsubscribe;
  }, [scrollYProgress]);

  return (
    <div className="relative bg-[#0a0a0c] text-white min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Global Floating Ball Canvas — SINGLE ball instance (desktop only) */}
      {!isMobile && <FloatingBall scrollProgress={ballProgress} />}

      <main>
        <Hero />
        <Products />
        <Analytics />
        <About />
        <Reviews />
        <Clients />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
