import Stripe from "stripe";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { buildQuote, normalizeCheckoutRequest, stripeLineItems, stripePriceEnvironment } from "../src/catalog";

function env(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`MISSING_${name}`);
  return value;
}

function orderRef(): string {
  return `WEB-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export const createCheckoutSession = internalAction({
  args: { payloadJson: v.string() },
  returns: v.object({ url: v.string(), orderRef: v.string() }),
  handler: async (ctx, args) => {
    const request = normalizeCheckoutRequest(JSON.parse(args.payloadJson));
    const quote = buildQuote(request.choices, new Date());
    const prices = stripePriceEnvironment();
    const ref = orderRef();
    const now = Date.now();
    await ctx.runMutation(internal.orders.createDraft, {
      orderRef: ref,
      website: request.choices.website,
      ai: request.choices.ai,
      maintenance: request.choices.maintenance,
      ...request.contact,
      oneTimeAmount: quote.oneTimeAmount,
      initialMonthlyAmount: quote.initialMonthlyAmount,
      regularMonthlyAmount: quote.regularMonthlyAmount,
      betaApplied: quote.betaApplied,
      betaEndsAt: quote.betaEndsAt,
      createdAt: now,
      retentionDeleteAt: now + 365 * 24 * 60 * 60 * 1000,
    });

    const stripe = new Stripe(env("STRIPE_SECRET_KEY"));
    const mode: Stripe.Checkout.SessionCreateParams.Mode = quote.hasRecurring ? "subscription" : "payment";
    const metadata = { order_ref: ref, integration_identifier: "webbtjanst_checkout_qkzrmnva" };
    try {
      const session = await stripe.checkout.sessions.create({
        integration_identifier: "webbtjanst_checkout_qkzrmnva",
        mode,
        line_items: stripeLineItems(request.choices, prices),
        client_reference_id: ref,
        customer_email: request.contact.email,
        locale: "sv",
        billing_address_collection: "auto",
        success_url: `${env("WEBBTJANST_CHECKOUT_SUCCESS_URL")}?session_id={CHECKOUT_SESSION_ID}&order=${encodeURIComponent(ref)}`,
        cancel_url: `${env("WEBBTJANST_CHECKOUT_CANCEL_URL")}&order=${encodeURIComponent(ref)}`,
        metadata,
        ...(quote.betaApplied ? { discounts: [{ coupon: prices.betaCouponId }] } : {}),
        ...(mode === "subscription" ? { subscription_data: { metadata } } : { payment_intent_data: { metadata }, invoice_creation: { enabled: true } }),
      }, { idempotencyKey: `checkout-session-${ref}` });
      if (!session.url) throw new Error("STRIPE_SESSION_URL_MISSING");
      await ctx.runMutation(internal.orders.setCheckoutSession, { orderRef: ref, stripeSessionId: session.id, updatedAt: Date.now() });
      return { url: session.url, orderRef: ref };
    } catch (error) {
      await ctx.runMutation(internal.orders.markCheckoutFailure, { orderRef: ref, errorCode: "STRIPE_CHECKOUT_CREATE_FAILED", updatedAt: Date.now() });
      throw error;
    }
  },
});
