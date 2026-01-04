import React, { useMemo, useState } from 'react';

type Props = {
  sessionId: string;
};

export const CheckoutSuccess: React.FC<Props> = ({ sessionId }) => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
  const bookingUrl = ((import.meta as any).env?.VITE_BOOKING_URL as string | undefined) || '';

  const ready = useMemo(() => Boolean(supabaseUrl && supabaseAnonKey && sessionId), [supabaseUrl, supabaseAnonKey, sessionId]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ready || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData(e.currentTarget);
      const payload = {
        session_id: sessionId,
        name: String(form.get('name') || ''),
        company: String(form.get('company') || ''),
        email: String(form.get('email') || ''),
        phone: String(form.get('phone') || ''),
        goal: String(form.get('goal') || ''),
        inspiration: String(form.get('inspiration') || ''),
        notes: String(form.get('notes') || ''),
        meeting_link: String(form.get('meeting_link') || bookingUrl || ''),
      };

      const res = await fetch(`${supabaseUrl!.replace(/\/+$/, '')}/functions/v1/submit-intake`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey!,
          Authorization: `Bearer ${supabaseAnonKey!}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Tack! Betalning mottagen.</h1>
        <p className="text-slate-600">
          Vi saknar Supabase-konfiguration på siten. Lägg in <code className="px-2 py-1 bg-slate-100 rounded">VITE_SUPABASE_URL</code> och{' '}
          <code className="px-2 py-1 bg-slate-100 rounded">VITE_SUPABASE_ANON_KEY</code> och deploya om.
        </p>
      </div>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-10">
          <div className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Nästa steg
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mt-4">Tack! Boka möte + fyll i underlaget</h1>
          <p className="text-slate-600 mt-3">
            Det här tar 2–3 minuter. När du skickar in får vi allt på mail och i Supabase, och du kan boka ett möte direkt.
          </p>
        </div>

        {done ? (
          <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 shadow-inner space-y-4">
            <h2 className="text-2xl font-bold">Klart!</h2>
            <p className="text-slate-600">Vi har fått ditt underlag. Vi kontaktar dig på mail och bekräftar nästa steg.</p>
            {bookingUrl && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Boka möte
              </a>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                <h3 className="text-xl font-bold">1) Boka möte</h3>
                <p className="text-slate-600 mt-2 text-sm">
                  Klicka och välj en tid. Lägg länken i formuläret (så vi matchar rätt order).
                </p>
                {bookingUrl ? (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all w-full"
                  >
                    Öppna bokning
                  </a>
                ) : (
                  <p className="text-sm text-slate-500 mt-4 italic">
                    Lägg in <code className="px-2 py-1 bg-white rounded border">VITE_BOOKING_URL</code> senare när du har din Calendly-länk.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 shadow-inner">
              <form className="space-y-6" onSubmit={submit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Namn</label>
                    <input name="name" required className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Ditt namn" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Företag</label>
                    <input name="company" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Företagsnamn" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">E-post</label>
                  <input name="email" type="email" required className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="din@email.se" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Telefon (valfritt)</label>
                  <input name="phone" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="+46 ..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Mål med hemsidan</label>
                  <textarea name="goal" rows={3} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Vad ska hemsidan uppnå?"></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Designinspiration (länkar)</label>
                  <textarea name="inspiration" rows={2} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Länkar till sidor du gillar"></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Övrigt</label>
                  <textarea name="notes" rows={3} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Allt som är viktigt att veta"></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Möteslänk (lägg in efter bokning)</label>
                  <input name="meeting_link" defaultValue={bookingUrl} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="https://..." />
                </div>

                {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

                <button
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all uppercase tracking-widest text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Skickar…' : 'Skicka underlag'}
                </button>
                <p className="text-xs text-slate-500">
                  Session: <code className="px-2 py-1 bg-white rounded border">{sessionId}</code>
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
