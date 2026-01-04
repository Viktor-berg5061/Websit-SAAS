// Supabase Edge Function: create-checkout-session
// Public endpoint (deploy with --no-verify-jwt)

import Stripe from "npm:stripe@14.25.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PackageKey = "Basic" | "Professional" | "Business/Premium";

const getEnv = (key: string) => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`Missing env: ${key}`);
  return value;
};

const stripe = new Stripe(getEnv("STRIPE_SECRET_KEY"), { apiVersion: "2023-10-16" });

const priceIdForPackage = (pkg: PackageKey) => {
  if (pkg === "Basic") return getEnv("STRIPE_PRICE_BASIC");
  if (pkg === "Professional") return getEnv("STRIPE_PRICE_PROFESSIONAL");
  return getEnv("STRIPE_PRICE_BUSINESS");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const pkg = body?.package as PackageKey | undefined;
    const success_url = body?.success_url as string | undefined;
    const cancel_url = body?.cancel_url as string | undefined;

    if (!pkg || !success_url || !cancel_url) {
      return new Response(JSON.stringify({ error: "Missing required fields (package, success_url, cancel_url)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceIdForPackage(pkg), quantity: 1 }],
      success_url,
      cancel_url,
      metadata: { package: pkg },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_creation: "always",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

