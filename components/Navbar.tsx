
import React, { useState, useEffect } from 'react';

interface NavbarProps {
  currentView: 'home' | 'portfolio';
  onViewChange: (view: 'home' | 'portfolio') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Tjänster', href: '#features', view: 'home' },
    { name: 'Referenser', href: '#portfolio', view: 'portfolio' },
    { name: 'Process', href: '#process', view: 'home' },
    { name: 'Priser', href: '#pricing', view: 'home' },
    { name: 'Kontakt', href: '#contact', view: 'home' },
  ];

  const handleLinkClick = (e: React.MouseEvent, link: typeof navLinks[0]) => {
    if (link.view === 'home' && currentView === 'home') {
      // Stay on home and scroll to anchor
      return;
    }
    
    e.preventDefault();
    onViewChange(link.view as 'home' | 'portfolio');
    
    // If it's an anchor on home and we just switched, we might need a small delay to scroll
    if (link.view === 'home' && link.href.startsWith('#')) {
      setTimeout(() => {
        const el = document.querySelector(link.href);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled || currentView === 'portfolio' ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => onViewChange('home')}
        >
          <div className="w-8 h-8 bg-black rounded-sm"></div>
          <span className="text-xl font-bold tracking-tighter uppercase">Webbtjanst</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              onClick={(e) => handleLinkClick(e, link)}
              className={`text-sm font-medium transition-colors ${
                (link.view === 'portfolio' && currentView === 'portfolio') || (link.view === 'home' && currentView === 'home' && !scrolled)
                ? 'text-blue-600' 
                : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contact" 
            onClick={(e) => {
              if (currentView !== 'home') {
                e.preventDefault();
                onViewChange('home');
                setTimeout(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }
            }}
            className="bg-black text-white px-6 py-2 text-sm font-medium rounded-full hover:bg-slate-800 transition-all"
          >
            Starta Projekt
          </a>
        </div>

        <div className="md:hidden">
           <button className="text-black">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
           </button>
        </div>
      </div>
    </nav>
  );
};
