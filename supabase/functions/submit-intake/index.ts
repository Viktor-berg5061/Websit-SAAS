// Supabase Edge Function: submit-intake
// Public endpoint (deploy with --no-verify-jwt)
// Validates that the Stripe session is paid, stores intake, then emails admin.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const getEnv = (key: string) => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`Missing env: ${key}`);
  return value;
};

const supabase = createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"));

const resendFetch = async (apiKey: string, payload: unknown) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) throw new Error(text || `Email failed (${res.status})`);
  return text;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const sessionId = String(body?.session_id || "").trim();
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing session_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, email, name, package, amount, currency, status, stripe_session_id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (orderErr) throw new Error(orderErr.message);
    if (!order) return new Response(JSON.stringify({ error: "Order not found yet. Vänta 5–10 sek och ladda om." }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (order.status !== "paid") return new Response(JSON.stringify({ error: "Order is not paid." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const intake = {
      order_id: order.id,
      company: String(body?.company || "") || null,
      phone: String(body?.phone || "") || null,
      goal: String(body?.goal || "") || null,
      inspiration: String(body?.inspiration || "") || null,
      notes: String(body?.notes || "") || null,
      answers_json: body ?? null,
      meeting_link: String(body?.meeting_link || "") || null,
    };

    const { error: intakeErr } = await supabase.from("intake_forms").insert(intake);
    if (intakeErr) throw new Error(intakeErr.message);

    // Email admin (optional but recommended)
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "vberg024@gmail.com";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom = Deno.env.get("RESEND_FROM") || "onboarding@resend.dev";

    if (resendApiKey) {
      const subject = `Ny betalning: ${order.package} (${order.amount} ${order.currency.toUpperCase()})`;
      const customerLine = `${order.name || ""} ${order.email || ""}`.trim();
      const html = `
        <h2>Ny order (betald)</h2>
        <p><strong>Plan:</strong> ${order.package}</p>
        <p><strong>Kund:</strong> ${customerLine || "-"}</p>
        <p><strong>Session:</strong> ${order.stripe_session_id}</p>
        <hr/>
        <h3>Intake</h3>
        <pre style="white-space:pre-wrap;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
${JSON.stringify(body, null, 2)}
        </pre>
      `;

      await resendFetch(resendApiKey, { from: resendFrom, to: [adminEmail], subject, html });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

