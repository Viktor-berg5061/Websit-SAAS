
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Nuvarande leveranstid: 24-48 timmar</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl leading-tight font-bold text-slate-900">
              Vi bygger din hemsida <span className="text-blue-600 italic">innan du hinner blinka.</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl">
              Få en professionell, konverterande och estetisk hemsida klar på under 48 timmar. 
              Vi har eliminerat väntetiden utan att offra kvaliteten.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
              <a href="#pricing" className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-black/10">
                Se våra paket
              </a>
              <a href="#process" className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-full font-semibold hover:bg-slate-50 transition-all">
                Hur fungerar det?
              </a>
            </div>
            
            <div className="flex items-center justify-center md:justify-start space-x-6 pt-4 grayscale opacity-60">
              <span className="text-xs font-bold uppercase tracking-widest">Använder:</span>
              <span className="font-bold text-lg">Webflow</span>
              <span className="font-bold text-lg">Framer</span>
              <span className="font-bold text-lg">Wix Studio</span>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://picsum.photos/800/600?grayscale" 
                alt="Professional web design" 
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-100 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
