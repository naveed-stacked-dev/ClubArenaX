import React, { useState, useEffect, useRef } from 'react';
import { useScroll } from 'framer-motion';

import FloatingBall from '../Home/components/FloatingBall';
import Hero from '../Home/sections/Hero';
import Products from '../Home/sections/Products';
import Analytics from '../Home/sections/Analytics';
import About from '../Home/sections/About';
import Reviews from '../Home/sections/Reviews';
import Clients from '../Home/sections/Clients';
import Contact from '../Home/sections/Contact';

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scrollProgressRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      scrollProgressRef.current = v;
    });
  }, [scrollYProgress]);

  return (
    <>
      {!isMobile && <FloatingBall scrollProgressRef={scrollProgressRef} />}
      <Hero />
      <Products />
      <Analytics />
      <About />
      <Reviews />
      <Clients />
      <Contact />
    </>
  );
}
