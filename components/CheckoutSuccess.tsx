import React, { useMemo, useState } from 'react';

type Props = {
  sessionId: string;
};

type Slot = { label: string; iso: string; disabled: boolean };

export const CheckoutSuccess: React.FC<Props> = ({ sessionId }) => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // YYYY-MM-DD
  const [booked, setBooked] = useState<Array<{ start_time: string; end_time: string; kind: string }>>([]);
  const [bookingStart, setBookingStart] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
  const bookingUrl = ((import.meta as any).env?.VITE_BOOKING_URL as string | undefined) || '';

  const ready = useMemo(() => Boolean(supabaseUrl && supabaseAnonKey && sessionId), [supabaseUrl, supabaseAnonKey, sessionId]);

  const today = new Date();
  const maxMonthsAhead = 2; // show current month + 2 = 3 months total
  const monthDate = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    return d;
  }, [monthOffset]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('sv-SE', { month: 'long', year: 'numeric' }).format(monthDate);
  }, [monthDate]);

  const daysInMonth = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const firstDay = start.getDay(); // 0 Sun..6 Sat
    const leading = (firstDay + 6) % 7; // make Monday=0
    const totalDays = end.getDate();
    const cells: Array<{ day: number | null; dateKey: string | null; isPast: boolean }> = [];

    for (let i = 0; i < leading; i++) cells.push({ day: null, dateKey: null, isPast: false });
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      cells.push({ day, dateKey, isPast });
    }
    return cells;
  }, [monthDate, today]);

  const fetchBooked = async (day: string) => {
    if (!supabaseUrl || !supabaseAnonKey) return;
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/functions/v1/booked-slots`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ day }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
      setBooked(json?.items || []);
    } catch (err) {
      setBooked([]);
      setError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setLoadingSlots(false);
    }
  };

  const generateSlots = (dayKey: string, bookedItems: Array<{ start_time: string; end_time: string }>): Slot[] => {
    const [y, m, d] = dayKey.split('-').map(Number);
    const day = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
    const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Stockholm', weekday: 'short' }).format(day);
    const isWeekend = weekday === 'Sat' || weekday === 'Sun';

    const startHour = isWeekend ? 15 : 16;
    const startMinute = isWeekend ? 0 : 30;
    const lastStartHour = isWeekend ? 22 : 20;

    const bookedStarts = new Set(bookedItems.map((b) => new Date(b.start_time).toISOString()));
    const slots: Slot[] = [];

    // Build times in local timezone (browser) and send ISO to server.
    let cursor = new Date(y, (m || 1) - 1, d || 1, startHour, startMinute, 0, 0);
    const endLast = new Date(y, (m || 1) - 1, d || 1, lastStartHour, 0, 0, 0);

    while (cursor.getTime() <= endLast.getTime()) {
      const iso = cursor.toISOString();
      const label = new Intl.DateTimeFormat('sv-SE', { hour: '2-digit', minute: '2-digit' }).format(cursor);
      const disabled = bookedStarts.has(iso);
      slots.push({ label, iso, disabled });
      cursor = new Date(cursor.getTime() + 60 * 60 * 1000);
    }

    return slots;
  };

  const slots = useMemo(() => {
    if (!selectedDay) return [];
    return generateSlots(selectedDay, booked);
  }, [selectedDay, booked]);

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
        booking_start: bookingStart,
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
                <h3 className="text-xl font-bold">1) Välj en tid (1h)</h3>
                <p className="text-slate-600 mt-2 text-sm">
                  Vardagar är upptaget till 16:30 och senast 21:00. Helger från 15:00 till 23:00.
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
                    disabled={monthOffset === 0}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  <div className="text-sm font-bold capitalize">{monthLabel}</div>
                  <button
                    type="button"
                    onClick={() => setMonthOffset((m) => Math.min(maxMonthsAhead, m + 1))}
                    disabled={monthOffset >= maxMonthsAhead}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-slate-500">
                  {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {daysInMonth.map((cell, idx) => {
                    if (!cell.day || !cell.dateKey) return <div key={idx} className="h-9" />;
                    const active = selectedDay === cell.dateKey;
                    const disabled = cell.isPast;
                    return (
                      <button
                        key={cell.dateKey}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          setSelectedDay(cell.dateKey);
                          setBookingStart(null);
                          fetchBooked(cell.dateKey);
                        }}
                        className={`h-9 rounded-lg border text-sm transition ${
                          active ? 'border-blue-600 bg-white shadow-sm font-bold' : 'border-slate-200 bg-white hover:border-blue-300'
                        } ${disabled ? 'opacity-40 cursor-not-allowed hover:border-slate-200' : ''}`}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">Tider</p>
                    {loadingSlots && <p className="text-xs text-slate-500">Laddar…</p>}
                  </div>
                  {!selectedDay ? (
                    <p className="text-sm text-slate-500 mt-2">Välj en dag för att se lediga tider.</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {slots.map((s) => {
                        const active = bookingStart === s.iso;
                        return (
                          <button
                            key={s.iso}
                            type="button"
                            disabled={s.disabled}
                            onClick={() => setBookingStart(s.iso)}
                            className={`px-3 py-2 rounded-lg border text-sm transition ${
                              active ? 'border-blue-600 bg-blue-600 text-white font-bold' : 'border-slate-200 bg-white hover:border-blue-300'
                            } ${s.disabled ? 'opacity-40 cursor-not-allowed hover:border-slate-200' : ''}`}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {selectedDay && !bookingStart && (
                    <p className="text-xs text-slate-500 mt-3">
                      Välj en tid. Du kan fortfarande skicka underlaget utan bokning, men det går snabbast om du väljer en tid.
                    </p>
                  )}
                </div>
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
                {bookingUrl ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Möteslänk (valfritt)</label>
                    <input
                      name="meeting_link"
                      defaultValue={bookingUrl}
                      className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>
                ) : null}

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
