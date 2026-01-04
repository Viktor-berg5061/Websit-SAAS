
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Tiers } from './components/Tiers';
import { Process } from './components/Process';
import { ContactForm } from './components/ContactForm';
import { Footer } from './components/Footer';
import { Portfolio } from './components/Portfolio';
import { CheckoutSuccess } from './components/CheckoutSuccess';
import { createCheckoutSession } from './services/checkout';

function App() {
  const [view, setView] = useState<'home' | 'portfolio'>('home');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [successSessionId, setSuccessSessionId] = useState<string | null>(null);

  // Handle hash changes for navigation if needed, but state is cleaner for this request
  const navigateTo = (newView: 'home' | 'portfolio') => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const canceled = params.get('canceled');
    const sessionId = params.get('session_id');

    if (success === '1' && sessionId) {
      setSuccessSessionId(sessionId);
      setCheckoutError(null);
      return;
    }

    if (canceled === '1') {
      setCheckoutError('Betalningen avbröts. Prova igen när du är redo.');
    }
  }, []);

  const startCheckout = async (pkg: string) => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const url = await createCheckoutSession(pkg as any);
      window.location.assign(url);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentView={view} onViewChange={navigateTo} />
      <main className="flex-grow">
        {successSessionId ? (
          <CheckoutSuccess sessionId={successSessionId} />
        ) : view === 'home' ? (
          <>
            <Hero />
            <Features />
            <Process />
            <Tiers onChoosePackage={startCheckout} />
            <ContactForm />
          </>
        ) : (
          <Portfolio />
        )}
      </main>
      <Footer />
      {checkoutError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-xl w-[calc(100%-2rem)] bg-white border border-red-200 shadow-xl rounded-2xl px-5 py-4">
          <p className="text-sm font-bold text-red-700">Checkout</p>
          <p className="text-sm text-slate-700 mt-1">{checkoutError}</p>
        </div>
      )}
      {checkoutLoading && (
        <div className="fixed inset-0 z-[70] bg-black/30 flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 w-full max-w-md text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-lg font-bold mt-4">Öppnar betalning…</p>
            <p className="text-slate-600 text-sm mt-2">Om inget händer: kontrollera att Stripe + Supabase är kopplat.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
