import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const LEASE_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export const claim = internalMutation({
  args: { workerId: v.string(), limit: v.number(), now: v.number() },
  returns: v.array(v.object({
    jobId: v.string(), orderRef: v.string(), lane: v.union(v.literal("website"), v.literal("ai_receptionist"), v.literal("maintenance")),
    company: v.string(), contactName: v.string(), phone: v.string(), email: v.string(),
    website: v.union(v.literal("start"), v.literal("tillvaxt"), v.literal("premium")),
    ai: v.union(v.literal("nej"), v.literal("start"), v.literal("tillvaxt"), v.literal("premium")),
    maintenance: v.union(v.literal("nej"), v.literal("online"), v.literal("trygg"), v.literal("aktiv"), v.literal("partner")),
    betaApplied: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(10, Math.floor(args.limit)));
    const expired = await ctx.db.query("fulfillmentOutbox").withIndex("by_status_lease", (q) => q.eq("status", "leased").lte("leaseUntil", args.now)).take(limit);
    for (const job of expired) await ctx.db.patch(job._id, { status: "retry", workerId: undefined, leaseUntil: undefined, availableAt: args.now, updatedAt: args.now });
    const pending = await ctx.db.query("fulfillmentOutbox").withIndex("by_status_available", (q) => q.eq("status", "pending").lte("availableAt", args.now)).take(limit);
    const retry = pending.length < limit
      ? await ctx.db.query("fulfillmentOutbox").withIndex("by_status_available", (q) => q.eq("status", "retry").lte("availableAt", args.now)).take(limit - pending.length)
      : [];
    const jobs = [...pending, ...retry];
    const result = [];
    for (const job of jobs) {
      const order = await ctx.db.query("checkoutOrders").withIndex("by_order_ref", (q) => q.eq("orderRef", job.orderRef)).unique();
      if (!order || order.status !== "paid") continue;
      await ctx.db.patch(job._id, { status: "leased", workerId: args.workerId, leaseUntil: args.now + LEASE_MS, updatedAt: args.now });
      result.push({ jobId: job.jobId, orderRef: order.orderRef, lane: job.lane, company: order.company, contactName: order.contactName, phone: order.phone, email: order.email, website: order.website, ai: order.ai, maintenance: order.maintenance, betaApplied: order.betaApplied });
    }
    return result;
  },
});

export const complete = internalMutation({
  args: { workerId: v.string(), jobId: v.string(), now: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db.query("fulfillmentOutbox").withIndex("by_job_id", (q) => q.eq("jobId", args.jobId)).unique();
    if (!job || job.status !== "leased" || job.workerId !== args.workerId) throw new Error("LEASE_NOT_OWNED");
    await ctx.db.patch(job._id, { status: "completed", leaseUntil: undefined, updatedAt: args.now });
    const remaining = await ctx.db.query("fulfillmentOutbox").withIndex("by_order_ref", (q) => q.eq("orderRef", job.orderRef)).collect();
    const order = await ctx.db.query("checkoutOrders").withIndex("by_order_ref", (q) => q.eq("orderRef", job.orderRef)).unique();
    if (order && remaining.every((item) => item._id === job._id || item.status === "completed")) await ctx.db.patch(order._id, { routingStatus: "complete", updatedAt: args.now });
    return null;
  },
});

export const fail = internalMutation({
  args: { workerId: v.string(), jobId: v.string(), errorCode: v.string(), now: v.number() },
  returns: v.object({ deadLetter: v.boolean() }),
  handler: async (ctx, args) => {
    const job = await ctx.db.query("fulfillmentOutbox").withIndex("by_job_id", (q) => q.eq("jobId", args.jobId)).unique();
    if (!job || job.status !== "leased" || job.workerId !== args.workerId) throw new Error("LEASE_NOT_OWNED");
    const attempts = job.attempts + 1;
    const deadLetter = attempts >= MAX_ATTEMPTS;
    await ctx.db.patch(job._id, {
      status: deadLetter ? "dead_letter" : "retry", attempts, workerId: undefined, leaseUntil: undefined,
      lastErrorCode: args.errorCode.slice(0, 80), availableAt: args.now + Math.min(60 * 60 * 1000, 30_000 * 2 ** attempts), updatedAt: args.now,
    });
    const order = await ctx.db.query("checkoutOrders").withIndex("by_order_ref", (q) => q.eq("orderRef", job.orderRef)).unique();
    if (order) await ctx.db.patch(order._id, { routingStatus: deadLetter ? "dead_letter" : "partial", updatedAt: args.now });
    return { deadLetter };
  },
});
