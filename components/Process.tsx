
import React from 'react';

const steps = [
  {
    time: '0h - 2h',
    title: 'Onboarding',
    desc: 'Du betalar och fyller i vårt strategiska formulär. Allt material laddas upp direkt.'
  },
  {
    time: '4h - 12h',
    title: 'Struktur & Draft',
    desc: 'Vi sätter sajtens stomme, CTA-knappar och navigation med hjälp av AI och moderna mallar.'
  },
  {
    time: '12h - 24h',
    title: 'Design & Innehåll',
    desc: 'Våra designers applicerar dina färger, bilder och texter. Allt SEO-optimeras från grunden.'
  },
  {
    time: '24h - 48h',
    title: 'Lansering',
    desc: 'Efter en snabb feedback-runda kopplar vi domänen, aktiverar SSL och din sajt är live!'
  }
];

export const Process: React.FC = () => {
  return (
    <section id="process" className="py-24 bg-white overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="w-full md:w-1/3 md:sticky md:top-32">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Processen bakom hastigheten.</h2>
            <p className="text-slate-600 mb-8">
              För att leverera på 48 timmar krävs en process som liknar ett löpande band. Varje steg är fördefinierat och optimerat för att eliminera flaskhalsar.
            </p>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-2">Viktigt!</p>
              <p className="text-xs text-slate-500">
                För de högre paketen inkluderar vi fördjupade möten och upp till en veckas iterativt arbete för att nå absolut perfektion. Men den första stora versionen står alltid klar inom 48h.
              </p>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 space-y-12">
            {steps.map((step, i) => (
              <div key={i} className="relative pl-12 border-l-2 border-slate-100 pb-8 last:pb-0">
                <div className="absolute left-0 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{step.time}</span>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed max-w-xl">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
