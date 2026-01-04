// Supabase Edge Function: stripe-webhook
// Stripe sends checkout.session.completed here.
// Deploy with --no-verify-jwt and set STRIPE_WEBHOOK_SECRET.

import Stripe from "npm:stripe@14.25.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const getEnv = (key: string) => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`Missing env: ${key}`);
  return value;
};

const stripe = new Stripe(getEnv("STRIPE_SECRET_KEY"), { apiVersion: "2023-10-16" });
const supabase = createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing Stripe signature" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, getEnv("STRIPE_WEBHOOK_SECRET"));

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email || session.customer_email || null;
      const name = session.customer_details?.name || null;
      const packageName = (session.metadata?.package as string | undefined) || "Unknown";
      const amount = session.amount_total ?? 0;
      const currency = session.currency ?? "sek";
      const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;

      const { error } = await supabase.from("orders").upsert(
        {
          stripe_session_id: session.id,
          stripe_customer_id: stripeCustomerId,
          email,
          name,
          package: packageName,
          amount,
          currency,
          status: "paid",
        },
        { onConflict: "stripe_session_id" },
      );

      if (error) throw new Error(error.message);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

