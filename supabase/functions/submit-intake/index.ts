// Supabase Edge Function: submit-intake
// Public endpoint (deploy with --no-verify-jwt)
// Verifies Stripe payment (webhook OR direct-check fallback), stores intake, stores booking, emails admin.

import Stripe from "npm:stripe@14.25.0";
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"));
    const stripe = new Stripe(getEnv("STRIPE_SECRET_KEY"), { apiVersion: "2023-10-16" });

    const body = await req.json();
    const sessionId = String(body?.session_id || "").trim();
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing session_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, email, name, package, amount, currency, status, stripe_session_id, stripe_customer_id")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    };

    // Try to find order (webhook may be slightly delayed)
    let order: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      order = await fetchOrder();
      if (order) break;
      await sleep(1500);
    }

    // If missing OR not paid: verify directly with Stripe (fallback, avoids "stuck" state)
    if (!order || order.status !== "paid") {
      let session: Stripe.Checkout.Session;
      try {
        session = (await stripe.checkout.sessions.retrieve(sessionId)) as Stripe.Checkout.Session;
      } catch {
        return new Response(JSON.stringify({ error: "Kunde inte verifiera betalningen. Vänta 10 sek och ladda om." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (session.payment_status !== "paid") {
        return new Response(JSON.stringify({ error: "Betalningen är inte registrerad än. Vänta 10 sek och ladda om." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const packageName = (session.metadata?.package as string | undefined) || order?.package || "Unknown";
      const email = session.customer_details?.email || session.customer_email || order?.email || null;
      const name = session.customer_details?.name || order?.name || null;
      const amount = session.amount_total ?? order?.amount ?? 0;
      const currency = session.currency ?? order?.currency ?? "sek";
      const stripeCustomerId = typeof session.customer === "string" ? session.customer : order?.stripe_customer_id || null;

      const { data: upserted, error: upsertErr } = await supabase
        .from("orders")
        .upsert(
          {
            stripe_session_id: sessionId,
            stripe_customer_id: stripeCustomerId,
            email,
            name,
            package: packageName,
            amount,
            currency,
            status: "paid",
          },
          { onConflict: "stripe_session_id" },
        )
        .select("id, email, name, package, amount, currency, status, stripe_session_id, stripe_customer_id")
        .maybeSingle();

      if (upsertErr) throw new Error(upsertErr.message);
      if (!upserted) throw new Error("Kunde inte skapa order.");
      order = upserted;
    }

    // Optional booking (1h slot)
    let bookingStart: string | null = null;
    let bookingEnd: string | null = null;
    const bookingStartRaw = body?.booking_start ? String(body.booking_start) : "";

    if (bookingStartRaw) {
      const start = new Date(bookingStartRaw);
      if (Number.isNaN(start.getTime())) {
        return new Response(JSON.stringify({ error: "Invalid booking_start" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const end = new Date(start.getTime() + 60 * 60 * 1000);

      // Validate business rules in Europe/Stockholm
      const fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Stockholm",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const parts = Object.fromEntries(fmt.formatToParts(start).map((p) => [p.type, p.value]));
      const weekday = parts.weekday; // Mon/Tue...
      const hour = Number(parts.hour);
      const minute = Number(parts.minute);
      const isWeekend = weekday === "Sat" || weekday === "Sun";

      // Weekdays: 16:30–21:00 (last start 20:00)
      // Weekends: 15:00–23:00 (last start 22:00)
      const minHour = isWeekend ? 15 : 16;
      const minMinute = isWeekend ? 0 : 30;
      const maxStartHour = isWeekend ? 22 : 20;

      const startsTooEarly = hour < minHour || (hour === minHour && minute < minMinute);
      const startsTooLate = hour > maxStartHour || (hour === maxStartHour && minute > 0);
      const badMinute = !(minute === 0 || minute === 30);

      if (badMinute || startsTooEarly || startsTooLate) {
        return new Response(JSON.stringify({ error: "Vald tid är utanför bokningsbara tider." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If this order already has a booking, temporarily remove it so we can
      // check availability without conflicting with itself.
      const { data: existingBooking, error: existingBookingErr } = await supabase
        .from("bookings")
        .select("start_time, end_time")
        .eq("order_id", order.id)
        .maybeSingle();
      if (existingBookingErr) throw new Error(existingBookingErr.message);

      const desiredStart = start.toISOString();
      const desiredEnd = end.toISOString();

      const alreadySame =
        existingBooking &&
        String(existingBooking.start_time) === desiredStart &&
        String(existingBooking.end_time) === desiredEnd;

      if (!alreadySame && existingBooking) {
        const { error: delErr } = await supabase.from("bookings").delete().eq("order_id", order.id);
        if (delErr) throw new Error(delErr.message);
      }

      const { data: available, error: availErr } = await supabase.rpc("is_slot_available", {
        start_time: desiredStart,
        end_time: desiredEnd,
      });
      if (availErr) throw new Error(availErr.message);

      if (!available) {
        // Restore old booking if we removed it.
        if (!alreadySame && existingBooking) {
          await supabase.from("bookings").insert({
            order_id: order.id,
            start_time: existingBooking.start_time,
            end_time: existingBooking.end_time,
          });
        }

        return new Response(JSON.stringify({ error: "Tiden är inte längre ledig. Välj en annan tid." }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: bookingErr } = await supabase.from("bookings").upsert(
        {
          order_id: order.id,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        },
        { onConflict: "order_id" },
      );
      if (bookingErr) throw new Error(bookingErr.message);

      bookingStart = start.toISOString();
      bookingEnd = end.toISOString();
    }

    const intake = {
      order_id: order.id,
      company: String(body?.company || "") || null,
      phone: String(body?.phone || "") || null,
      goal: String(body?.goal || "") || null,
      inspiration: String(body?.inspiration || "") || null,
      notes: String(body?.notes || "") || null,
      answers_json: body ?? null,
      meeting_link: String(body?.meeting_link || "") || null,
      booking_start: bookingStart,
      booking_end: bookingEnd,
    };

    const { error: intakeErr } = await supabase.from("intake_forms").insert(intake);
    if (intakeErr) throw new Error(intakeErr.message);

    // Email admin (optional)
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "vberg024@gmail.com";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom = Deno.env.get("RESEND_FROM") || "onboarding@resend.dev";

    if (resendApiKey) {
      const currency = String(order.currency || "sek").toUpperCase();
      const amountMinor = Number(order.amount || 0);
      const amountMajor = Number.isFinite(amountMinor) ? amountMinor / 100 : 0;
      const amountLabel = (() => {
        try {
          return new Intl.NumberFormat("sv-SE", { style: "currency", currency }).format(amountMajor);
        } catch {
          return `${amountMajor} ${currency}`;
        }
      })();

      const subject = `Ny betalning: ${order.package} (${amountLabel})`;
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

      // Email is best-effort: don't fail the whole intake if Resend blocks the sender domain.
      try {
        await resendFetch(resendApiKey, { from: resendFrom, to: [adminEmail], subject, html });
      } catch (e) {
        console.error("Resend email failed:", e);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
