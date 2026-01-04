
import React, { useEffect, useMemo, useState } from 'react';

type PackageKey = 'Basic' | 'Professional' | 'Business/Premium';

type TiersProps = {
  onChoosePackage?: (pkg: string) => void;
};

type QuizQuestion = {
  id: string;
  title: string;
  subtitle?: string;
  options: Array<{
    id: string;
    label: string;
    detail?: string;
    weights: Partial<Record<PackageKey, number>>;
  }>;
};

const tiers = [
  {
    name: 'Basic',
    price: '5 000 kr',
    period: 'Engångsavgift',
    time: '24 Timmar',
    desc: 'Det ultimata startpaketet för dig som behöver en professionell närvaro direkt.',
    features: [
      '1-3 Skräddarsydda undersidor',
      'Full mobiloptimering',
      'SSL & Säkerhetskonfiguration',
      'Grundläggande SEO (Meta-data)',
      'Google Business Profile-stöd',
      'Koppling till egen domän'
    ],
    cta: 'Välj Basic',
    highlight: false
  },
  {
    name: 'Professional',
    price: '12 900 kr',
    period: 'Mest prisvärd',
    time: '24 - 48 Timmar',
    desc: 'Fokus på tillväxt och konvertering. Vi bygger en säljmaskin åt ditt företag.',
    features: [
      '5-10 Skräddarsydda undersidor',
      'Strategisk konverteringsdesign',
      'Integration av appar (Bokning/Chatt)',
      '1 Iterationsmöte efter lansering',
      'Hastighetsoptimering (Blixtsnabb)'
    ],
    cta: 'Välj Professional',
    highlight: true
  },
  {
    name: 'Business/Premium',
    price: '24 900 kr',
    period: 'Total frihet',
    time: '48 Timmar + 1 v refinement',
    desc: 'För de som kräver absolut toppklass och personlig vägledning hela vägen.',
    features: [
      'Obegränsat antal undersidor',
      'Avancerad funktion (E-handel/CMS)',
      '1 Vecka iterativ designprocess',
      'Personlig Strategisession (1h)',
      'Premium bildspråk & Ikonografi',
      'Full teknisk Onboarding',
      'Prioriterad support i 30 dagar'
    ],
    cta: 'Välj Business',
    highlight: false
  }
];

const quizQuestions: QuizQuestion[] = [
  {
    id: 'goal',
    title: 'Vad är viktigast just nu?',
    options: [
      { id: 'fast', label: 'Komma live snabbt', detail: 'En stark sida snabbt på plats', weights: { Basic: 3, Professional: 1 } },
      { id: 'growth', label: 'Tillväxt & konvertering', detail: 'Bygga en säljmotor', weights: { Basic: 1, Professional: 4, 'Business/Premium': 2 } },
      { id: 'premium', label: 'Premium helhetslösning', detail: 'Max kvalitet + vägledning', weights: { Professional: 2, 'Business/Premium': 5 } },
    ],
  },
  {
    id: 'scope',
    title: 'Hur mycket behöver du?',
    options: [
      { id: 'small', label: '1–3 undersidor', weights: { Basic: 4, Professional: 1 } },
      { id: 'mid', label: '5–10 undersidor', weights: { Basic: 1, Professional: 4, 'Business/Premium': 1 } },
      { id: 'big', label: 'Obegränsat / avancerat', weights: { Professional: 2, 'Business/Premium': 5 } },
    ],
  },
  {
    id: 'features',
    title: 'Behöver du avancerad funktion?',
    subtitle: 'Bokning, chatt, CMS eller e-handel.',
    options: [
      { id: 'no', label: 'Nej, inte nu', weights: { Basic: 3, Professional: 2 } },
      { id: 'some', label: 'Ja, lite', detail: 'Bokning/chatt', weights: { Basic: 1, Professional: 4, 'Business/Premium': 2 } },
      { id: 'yes', label: 'Ja, mycket', detail: 'CMS/e-handel + integrationer', weights: { Professional: 2, 'Business/Premium': 5 } },
    ],
  },
];

const PackageQuizModal: React.FC<{
  open: boolean;
  initialPackage: PackageKey;
  onClose: () => void;
  onSkip: (pkg: PackageKey) => void;
  onPick: (pkg: PackageKey) => void;
}> = ({ open, initialPackage, onClose, onSkip, onPick }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
    setAnswers({});
  }, [open, initialPackage]);

  const isDone = stepIndex >= quizQuestions.length;
  const current = quizQuestions[stepIndex];

  const scores = useMemo(() => {
    const base: Record<PackageKey, number> = { Basic: 0, Professional: 0, 'Business/Premium': 0 };
    for (const q of quizQuestions) {
      const picked = answers[q.id];
      if (!picked) continue;
      const opt = q.options.find((o) => o.id === picked);
      if (!opt) continue;
      for (const key of Object.keys(opt.weights) as PackageKey[]) base[key] += opt.weights[key] ?? 0;
    }
    base[initialPackage] += 1;
    return base;
  }, [answers, initialPackage]);

  const ranked = useMemo(() => {
    const entries = Object.entries(scores) as Array<[PackageKey, number]>;
    entries.sort((a, b) => b[1] - a[1]);
    return entries.map(([k]) => k);
  }, [scores]);

  const topTwo = ranked.slice(0, 2);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-900 transition" aria-label="Close">
          ×
        </button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Snabbt quiz
            </div>
            <h3 className="text-2xl font-bold mt-3">Få 2 rekommenderade paket (i ordning)</h3>
            <p className="text-slate-500 text-sm mt-2">Tar ~15–20 sek. Du kan hoppa över och fortsätta med paketet du klickade på.</p>
          </div>
          <button
            onClick={() => onSkip(initialPackage)}
            className="shrink-0 bg-white border border-slate-300 text-slate-900 px-4 py-2 rounded-xl font-bold hover:border-blue-300 transition-all text-sm"
          >
            Hoppa över
          </button>
        </div>

        {!isDone ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Fråga {stepIndex + 1} av {quizQuestions.length}
              </span>
              <span className="font-semibold">Valt paket: {initialPackage}</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <p className="text-lg font-bold text-slate-900">{current.title}</p>
              {current.subtitle && <p className="text-sm text-slate-500 mt-1">{current.subtitle}</p>}

              <div className="grid sm:grid-cols-3 gap-3 mt-5">
                {current.options.map((opt) => {
                  const active = answers[current.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: opt.id }))}
                      className={`text-left rounded-xl border p-4 transition-all ${
                        active ? 'border-blue-600 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <p className="text-sm font-bold">{opt.label}</p>
                      {opt.detail && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.detail}</p>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
                disabled={stepIndex === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:border-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm"
              >
                Tillbaka
              </button>
              <button
                type="button"
                onClick={() => setStepIndex((s) => s + 1)}
                disabled={!answers[current.id]}
                className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                Nästa
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rekommenderat</p>
              <h4 className="text-2xl font-bold mt-2">Dina 2 bästa paket</h4>
              <p className="text-slate-500 text-sm mt-2">Välj ett rekommenderat paket, eller fortsätt med det du klickade på.</p>

              <div className="grid md:grid-cols-2 gap-4 mt-5">
                {topTwo.map((pkg, idx) => (
                  <div key={pkg} className={`rounded-2xl border p-5 ${idx === 0 ? 'border-blue-600 bg-white' : 'border-slate-200 bg-white'}`}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">#{idx + 1}</p>
                    <p className="text-xl font-bold mt-1">{pkg}</p>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                      {pkg === 'Basic'
                        ? 'Perfekt för att komma live snabbt med en professionell närvaro.'
                        : pkg === 'Professional'
                        ? 'För tillväxt: konverteringsdesign, fler sidor och smarta integrationer.'
                        : 'För premium: avancerad funktion, iterativ designprocess och vägledning hela vägen.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => onPick(pkg)}
                      className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all text-sm"
                    >
                      Välj {pkg}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setStepIndex(0)}
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 hover:border-slate-300 transition font-bold text-sm"
              >
                Gör quizet igen
              </button>
              <button
                type="button"
                onClick={() => onSkip(initialPackage)}
                className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm flex-1"
              >
                Fortsätt med {initialPackage}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Tiers: React.FC<TiersProps> = ({ onChoosePackage }) => {
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizInitial, setQuizInitial] = useState<PackageKey>('Professional');

  const openQuiz = (pkg: PackageKey) => {
    setQuizInitial(pkg);
    setQuizOpen(true);
  };

  const proceed = (pkg: PackageKey) => {
    setQuizOpen(false);
    onChoosePackage?.(pkg);
  };

  return (
    <section id="pricing" className="py-20 bg-slate-50 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Välj rätt nivå för din framgång</h2>
          <p className="text-slate-600">Vi har paketerat allt du behöver för att dominera din nisch. Inga dolda avgifter, bara ren effekt.</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <div 
              key={i} 
              className={`relative bg-white rounded-3xl p-9 flex flex-col border transition-all duration-500 ${tier.highlight ? 'ring-2 ring-blue-600 shadow-2xl lg:scale-[1.02] z-10' : 'border-slate-200 shadow-sm hover:shadow-md'}`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-blue-200">
                  Rekommenderas för tillväxt
                </div>
              )}
              <div className="mb-7">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{tier.time} Leverans</span>
                    <h3 className="text-3xl font-bold mt-1">{tier.name}</h3>
                  </div>
                </div>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                  <span className="ml-2 text-slate-400 text-xs font-medium italic">{tier.period}</span>
                </div>
                <p className="mt-4 text-slate-500 text-sm leading-relaxed antialiased">{tier.desc}</p>
              </div>
              
              <div className="w-full h-px bg-slate-100 mb-7"></div>
              
              <ul className="flex-grow space-y-3 mb-8">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start text-sm text-slate-600 group">
                    <div className="mr-3 mt-1 flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-500 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span className="leading-tight">{f}</span>
                  </li>
                ))}
              </ul>
              
              <a 
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  openQuiz(tier.name as PackageKey);
                }}
                className={`w-full py-4 rounded-xl font-bold text-sm text-center transition-all duration-300 transform active:scale-95 ${tier.highlight ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200' : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200'}`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-white p-10 rounded-3xl border border-dashed border-slate-300 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-blue-300 transition-colors">
           <div className="space-y-2">
             <div className="inline-block px-3 py-1 bg-slate-100 rounded-md text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">För större organisationer</div>
             <h3 className="text-2xl font-bold">Behöver du en helt skräddarsydd Enterprise-lösning?</h3>
             <p className="text-slate-500 max-w-xl text-sm italic leading-relaxed">För komplexa systemintegrationer, global skalbarhet och högsta säkerhetskrav. Vi arbetar med strategisk analys och djupt tekniskt kunnande för att bygga din plattform.</p>
           </div>
           <a href="#contact" className="whitespace-nowrap bg-white border-2 border-slate-900 text-slate-900 px-10 py-4 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all duration-300 text-center shadow-sm">
             Begär offert
           </a>
        </div>
      </div>

      <PackageQuizModal
        open={quizOpen}
        initialPackage={quizInitial}
        onClose={() => setQuizOpen(false)}
        onSkip={(pkg) => proceed(pkg)}
        onPick={(pkg) => proceed(pkg)}
      />
    </section>
  );
};
