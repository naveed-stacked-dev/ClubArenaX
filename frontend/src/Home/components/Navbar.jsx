import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0c]/80 backdrop-blur-lg border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="w-12 h-12" />
        <div className="text-2xl font-bold tracking-tighter">
          <span className="text-white">Club</span>
          <span className="text-[#00f3ff]">Arena</span>
          <span className="text-[#bc13fe]">X</span>
        </div>
        </div>
        
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#products" className="hover:text-white transition-colors">Features</a>
          <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>

        <button className="bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] text-black font-semibold px-6 py-2 rounded-full shadow-[0_0_15px_rgba(188,19,254,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] transition-shadow">
          Get Started
        </button>
      </div>
    </motion.nav>
  );
}
