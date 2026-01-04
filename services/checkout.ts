type PackageKey = 'Basic' | 'Professional' | 'Business/Premium';

type CheckoutResponse = { url: string };

export const createCheckoutSession = async (pkg: PackageKey) => {
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase saknas (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  }

  const baseUrl = window.location.origin + window.location.pathname;
  const success_url = `${baseUrl}?success=1&session_id={CHECKOUT_SESSION_ID}`;
  const cancel_url = `${baseUrl}?canceled=1`;

  const res = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      package: pkg,
      success_url,
      cancel_url,
    }),
  });

  const json = (await res.json().catch(() => null)) as CheckoutResponse | { error?: string } | null;

  if (!res.ok) {
    const msg = (json as any)?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  if (!json || typeof (json as any).url !== 'string') {
    throw new Error('Ogiltigt svar från checkout.');
  }

  return (json as CheckoutResponse).url;
};
