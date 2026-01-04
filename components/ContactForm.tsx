import React, { useEffect, useState } from 'react';

type ContactFormProps = {
  selectedPackage?: string;
};

export const ContactForm: React.FC<ContactFormProps> = ({ selectedPackage }) => {
  const [step, setStep] = useState(1);
  const [packageChoice, setPackageChoice] = useState<string>('');

  useEffect(() => {
    if (!selectedPackage) return;
    setPackageChoice(selectedPackage);
  }, [selectedPackage]);

  return (
    <section id="contact" className="py-24 bg-white scroll-mt-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">Redo att gå live?</h2>
            <p className="text-slate-600">
              Fyll i vårt strategiska formulär. Ju mer info vi får, desto snabbare kan vi börja bygga. Vår process eliminerar behovet av långa uppstartsmöten.
            </p>

            <div className="space-y-6 pt-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 font-bold shrink-0">1</div>
                <div>
                  <h4 className="font-bold">Berätta om ditt mål</h4>
                  <p className="text-sm text-slate-500">Vad ska hemsidan uppnå? Sälja, informera eller samla leads?</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 font-bold shrink-0">2</div>
                <div>
                  <h4 className="font-bold">Designpreferenser</h4>
                  <p className="text-sm text-slate-500">Skicka med länkar på sidor du älskar så prickar vi rätt direkt.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 font-bold shrink-0">3</div>
                <div>
                  <h4 className="font-bold">Leverans</h4>
                  <p className="text-sm text-slate-500">Vi sätter igång produktionen direkt när materialet är inskickat.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 shadow-inner">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Namn</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    placeholder="Ditt namn"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Företag</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    placeholder="Företagsnamn"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">E-post</label>
                <input
                  type="email"
                  className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  placeholder="din@email.se"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Vilket paket är du intresserad av?</label>
                <select
                  value={packageChoice}
                  onChange={(e) => setPackageChoice(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                >
                  <option value="">Välj paket…</option>
                  <option value="Basic">Basic (5 000 kr)</option>
                  <option value="Professional">Professional (12 900 kr)</option>
                  <option value="Business/Premium">Business/Premium (24 900 kr)</option>
                  <option value="Enterprise">Enterprise (Custom)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Berätta kort om projektet</label>
                <textarea
                  rows={4}
                  className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  placeholder="Vilka är dina huvudmål?"
                ></textarea>
              </div>

              <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all uppercase tracking-widest text-sm">
                Skicka förfrågan
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

