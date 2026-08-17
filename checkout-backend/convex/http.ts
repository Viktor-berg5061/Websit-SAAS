import Stripe from "stripe";
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

function allowedOrigins(): Set<string> {
  return new Set((process.env.WEBBTJANST_ALLOWED_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000").split(",").map((value) => value.trim()).filter(Boolean));
}

function cors(origin: string | null): Record<string, string> {
  return origin && allowedOrigins().has(origin)
    ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization", Vary: "Origin" }
    : {};
}

function json(data: unknown, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors(origin) } });
}

function authorized(request: Request): boolean {
  const expected = process.env.WEBBTJANST_DISPATCH_TOKEN;
  return Boolean(expected && request.headers.get("Authorization") === `Bearer ${expected}`);
}

for (const path of ["/api/lead", "/api/checkout/session", "/api/dispatch/claim", "/api/dispatch/complete", "/api/dispatch/fail"]) {
  http.route({ path, method: "OPTIONS", handler: httpAction(async (_ctx, request) => new Response(null, { status: 204, headers: cors(request.headers.get("Origin")) })) });
}

http.route({
  path: "/api/lead",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");
    if (origin && !allowedOrigins().has(origin)) return json({ error: "ORIGIN_NOT_ALLOWED" }, 403, origin);
    const payloadJson = await request.text();
    if (payloadJson.length < 2 || payloadJson.length > 20_000) return json({ error: "INVALID_PAYLOAD" }, 400, origin);
    try {
      const payload = JSON.parse(payloadJson) as Record<string, unknown>;
      if (payload.site !== "webbtjanst") return json({ error: "INVALID_SOURCE" }, 400, origin);
      const leadRef = crypto.randomUUID();
      const now = Date.now();
      await ctx.runMutation(internal.leads.create, {
        leadRef,
        payloadJson: JSON.stringify(payload),
        createdAt: now,
        retentionDeleteAt: now + 180 * 24 * 60 * 60 * 1000,
      });
      return json({ ok: true, leadRef }, 201, origin);
    } catch {
      return json({ error: "INVALID_PAYLOAD" }, 400, origin);
    }
  }),
});

http.route({
  path: "/api/checkout/session",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");
    if (origin && !allowedOrigins().has(origin)) return json({ error: "ORIGIN_NOT_ALLOWED" }, 403, origin);
    const payloadJson = await request.text();
    if (payloadJson.length > 20_000) return json({ error: "PAYLOAD_TOO_LARGE" }, 413, origin);
    try {
      const result = await ctx.runAction(internal.checkout.createCheckoutSession, { payloadJson });
      return json(result, 200, origin);
    } catch {
      return json({ error: "CHECKOUT_UNAVAILABLE" }, 400, origin);
    }
  }),
});

http.route({
  path: "/api/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = request.headers.get("stripe-signature");
    if (!secret || !webhookSecret || !signature) return json({ error: "WEBHOOK_NOT_CONFIGURED" }, 503);
    const raw = await request.text();
    let event: Stripe.Event;
    try {
      const stripe = new Stripe(secret);
      event = await stripe.webhooks.constructEventAsync(raw, signature, webhookSecret);
    } catch {
      return json({ error: "INVALID_SIGNATURE" }, 400);
    }
    const supported = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"]);
    if (!supported.has(event.type)) return json({ received: true, ignored: true });
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    const paid = event.type === "checkout.session.async_payment_succeeded" || (event.type === "checkout.session.completed" && session.payment_status === "paid");
    const result = await ctx.runMutation(internal.orders.applyStripeEvent, {
      eventId: event.id, type: event.type, orderRef: session.metadata?.order_ref ?? session.client_reference_id ?? undefined,
      stripeSessionId: session.id, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId, stripePaymentIntentId: paymentIntentId,
      paid, failed: event.type === "checkout.session.async_payment_failed", expired: event.type === "checkout.session.expired", receivedAt: Date.now(),
    });
    return json({ received: true, ...result });
  }),
});

http.route({ path: "/api/dispatch/claim", method: "POST", handler: httpAction(async (ctx, request) => {
  if (!authorized(request)) return json({ error: "UNAUTHORIZED" }, 401);
  const body = await request.json() as { workerId?: unknown; limit?: unknown };
  if (typeof body.workerId !== "string" || !/^[a-z0-9_-]{2,64}$/i.test(body.workerId)) return json({ error: "INVALID_WORKER" }, 400);
  const jobs = await ctx.runMutation(internal.dispatcher.claim, { workerId: body.workerId, limit: typeof body.limit === "number" ? body.limit : 1, now: Date.now() });
  return json({ jobs });
}) });

http.route({ path: "/api/dispatch/complete", method: "POST", handler: httpAction(async (ctx, request) => {
  if (!authorized(request)) return json({ error: "UNAUTHORIZED" }, 401);
  const body = await request.json() as { workerId?: unknown; jobId?: unknown };
  if (typeof body.workerId !== "string" || typeof body.jobId !== "string") return json({ error: "INVALID_REQUEST" }, 400);
  await ctx.runMutation(internal.dispatcher.complete, { workerId: body.workerId, jobId: body.jobId, now: Date.now() });
  return json({ ok: true });
}) });

http.route({ path: "/api/dispatch/fail", method: "POST", handler: httpAction(async (ctx, request) => {
  if (!authorized(request)) return json({ error: "UNAUTHORIZED" }, 401);
  const body = await request.json() as { workerId?: unknown; jobId?: unknown; errorCode?: unknown };
  if (typeof body.workerId !== "string" || typeof body.jobId !== "string" || typeof body.errorCode !== "string") return json({ error: "INVALID_REQUEST" }, 400);
  const result = await ctx.runMutation(internal.dispatcher.fail, { workerId: body.workerId, jobId: body.jobId, errorCode: body.errorCode, now: Date.now() });
  return json({ ok: true, ...result });
}) });

http.route({ path: "/api/health", method: "GET", handler: httpAction(async () => json({ ok: true, service: "webbtjanst-checkout" })) });

export default http;
