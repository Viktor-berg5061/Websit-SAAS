
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white py-20 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-sm"></div>
            <span className="text-xl font-bold tracking-tighter uppercase">Webbtjanst</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Vi bygger morgondagens digitala närvaro idag. Med fokus på snabbhet, precision och modern design hjälper vi företag att lansera proffsiga hemsidor på rekordtid.
          </p>
        </div>
        
        <div className="space-y-6">
          <h4 className="font-bold text-lg">Länkar</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li><a href="#features" className="hover:text-white transition-colors">Tjänster</a></li>
            <li><a href="#process" className="hover:text-white transition-colors">Processen</a></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">Priser</a></li>
            <li><a href="#contact" className="hover:text-white transition-colors">Starta Nu</a></li>
          </ul>
        </div>
        
        <div className="space-y-6">
          <h4 className="font-bold text-lg">Kontakt</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li>Email: info@webfabriken.se</li>
            <li>Adress: Digitalvägen 1, Stockholm</li>
            <li>Telefon: +46 000 000 00</li>
          </ul>
        </div>
        
        <div className="space-y-6">
          <h4 className="font-bold text-lg">Nyhetsbrev</h4>
          <p className="text-slate-400 text-sm">Få tips om digital strategi och webbdesign.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Din e-post" className="bg-slate-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-1 focus:ring-slate-500 outline-none" />
            <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-xs uppercase">Sign</button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>&copy; 2025 Webbtjanst. Alla rättigheter reserverade.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Integritetspolicy</a>
          <a href="#" className="hover:text-white">Allmänna villkor</a>
        </div>
      </div>
    </footer>
  );
};
