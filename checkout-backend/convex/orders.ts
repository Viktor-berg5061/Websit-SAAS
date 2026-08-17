import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const website = v.union(v.literal("start"), v.literal("tillvaxt"), v.literal("premium"));
const ai = v.union(v.literal("nej"), v.literal("start"), v.literal("tillvaxt"), v.literal("premium"));
const maintenance = v.union(v.literal("nej"), v.literal("online"), v.literal("trygg"), v.literal("aktiv"), v.literal("partner"));

export const createDraft = internalMutation({
  args: {
    orderRef: v.string(), website, ai, maintenance,
    company: v.string(), contactName: v.string(), phone: v.string(), email: v.string(),
    oneTimeAmount: v.number(), initialMonthlyAmount: v.number(), regularMonthlyAmount: v.number(),
    betaApplied: v.boolean(), betaEndsAt: v.number(), createdAt: v.number(), retentionDeleteAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("checkoutOrders").withIndex("by_order_ref", (q) => q.eq("orderRef", args.orderRef)).unique();
    if (existing) throw new Error("ORDER_REF_EXISTS");
    await ctx.db.insert("checkoutOrders", {
      ...args,
      currency: "sek",
      status: "draft",
      routingStatus: "not_ready",
      updatedAt: args.createdAt,
    });
    return null;
  },
});

export const setCheckoutSession = internalMutation({
  args: { orderRef: v.string(), stripeSessionId: v.string(), updatedAt: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db.query("checkoutOrders").withIndex("by_order_ref", (q) => q.eq("orderRef", args.orderRef)).unique();
    if (!order) throw new Error("ORDER_NOT_FOUND");
    await ctx.db.patch(order._id, { stripeSessionId: args.stripeSessionId, status: "checkout_created", updatedAt: args.updatedAt });
    return null;
  },
});

export const markCheckoutFailure = internalMutation({
  args: { orderRef: v.string(), errorCode: v.string(), updatedAt: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db.query("checkoutOrders").withIndex("by_order_ref", (q) => q.eq("orderRef", args.orderRef)).unique();
    if (order && order.status === "draft") await ctx.db.patch(order._id, { checkoutErrorCode: args.errorCode, updatedAt: args.updatedAt });
    return null;
  },
});

export const applyStripeEvent = internalMutation({
  args: {
    eventId: v.string(), type: v.string(), orderRef: v.optional(v.string()), stripeSessionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()), stripeSubscriptionId: v.optional(v.string()), stripePaymentIntentId: v.optional(v.string()),
    paid: v.boolean(), failed: v.boolean(), expired: v.boolean(), receivedAt: v.number(),
  },
  returns: v.object({ duplicate: v.boolean(), routedJobs: v.number(), orphaned: v.boolean() }),
  handler: async (ctx, args) => {
    const duplicate = await ctx.db.query("stripeEvents").withIndex("by_event_id", (q) => q.eq("eventId", args.eventId)).unique();
    if (duplicate) return { duplicate: true, routedJobs: 0, orphaned: false };
    const order = args.orderRef
      ? await ctx.db.query("checkoutOrders").withIndex("by_order_ref", (q) => q.eq("orderRef", args.orderRef!)).unique()
      : null;
    await ctx.db.insert("stripeEvents", {
      eventId: args.eventId,
      type: args.type,
      orderRef: args.orderRef,
      outcome: order ? "processed" : "orphaned",
      receivedAt: args.receivedAt,
    });
    if (!order) return { duplicate: false, routedJobs: 0, orphaned: true };

    if (args.failed) {
      if (order.status !== "paid") await ctx.db.patch(order._id, { status: "payment_failed", updatedAt: args.receivedAt });
      return { duplicate: false, routedJobs: 0, orphaned: false };
    }
    if (args.expired) {
      if (order.status !== "paid") await ctx.db.patch(order._id, { status: "expired", updatedAt: args.receivedAt });
      return { duplicate: false, routedJobs: 0, orphaned: false };
    }
    if (!args.paid) return { duplicate: false, routedJobs: 0, orphaned: false };

    const lanes: Array<"website" | "ai_receptionist" | "maintenance"> = ["website"];
    if (order.ai !== "nej") lanes.push("ai_receptionist");
    if (order.maintenance !== "nej") lanes.push("maintenance");
    let routedJobs = 0;
    for (const lane of lanes) {
      const jobId = `${order.orderRef}:${lane}`;
      const existingJob = await ctx.db.query("fulfillmentOutbox").withIndex("by_job_id", (q) => q.eq("jobId", jobId)).unique();
      if (existingJob) continue;
      await ctx.db.insert("fulfillmentOutbox", {
        jobId, orderRef: order.orderRef, lane, status: "pending", attempts: 0,
        availableAt: args.receivedAt, createdAt: args.receivedAt, updatedAt: args.receivedAt,
      });
      routedJobs += 1;
    }
    await ctx.db.patch(order._id, {
      status: "paid", routingStatus: "pending", paidAt: order.paidAt ?? args.receivedAt, updatedAt: args.receivedAt,
      stripeSessionId: args.stripeSessionId ?? order.stripeSessionId,
      stripeCustomerId: args.stripeCustomerId ?? order.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId ?? order.stripeSubscriptionId,
      stripePaymentIntentId: args.stripePaymentIntentId ?? order.stripePaymentIntentId,
    });
    return { duplicate: false, routedJobs, orphaned: false };
  },
});
