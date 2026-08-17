import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const website = v.union(v.literal("start"), v.literal("tillvaxt"), v.literal("premium"));
const ai = v.union(v.literal("nej"), v.literal("start"), v.literal("tillvaxt"), v.literal("premium"));
const maintenance = v.union(v.literal("nej"), v.literal("online"), v.literal("trygg"), v.literal("aktiv"), v.literal("partner"));

export default defineSchema({
  websiteLeads: defineTable({
    leadRef: v.string(),
    source: v.literal("webbtjanst"),
    payloadJson: v.string(),
    status: v.literal("new"),
    createdAt: v.number(),
    retentionDeleteAt: v.number(),
  })
    .index("by_lead_ref", ["leadRef"])
    .index("by_retention", ["retentionDeleteAt"]),

  checkoutOrders: defineTable({
    orderRef: v.string(),
    status: v.union(v.literal("draft"), v.literal("checkout_created"), v.literal("paid"), v.literal("payment_failed"), v.literal("expired")),
    routingStatus: v.union(v.literal("not_ready"), v.literal("pending"), v.literal("processing"), v.literal("complete"), v.literal("partial"), v.literal("dead_letter")),
    website,
    ai,
    maintenance,
    company: v.string(),
    contactName: v.string(),
    phone: v.string(),
    email: v.string(),
    currency: v.literal("sek"),
    oneTimeAmount: v.number(),
    initialMonthlyAmount: v.number(),
    regularMonthlyAmount: v.number(),
    betaApplied: v.boolean(),
    betaEndsAt: v.number(),
    stripeSessionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    checkoutErrorCode: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    retentionDeleteAt: v.number(),
  })
    .index("by_order_ref", ["orderRef"])
    .index("by_stripe_session", ["stripeSessionId"])
    .index("by_status", ["status"])
    .index("by_retention", ["retentionDeleteAt"]),

  stripeEvents: defineTable({
    eventId: v.string(),
    type: v.string(),
    orderRef: v.optional(v.string()),
    outcome: v.union(v.literal("processed"), v.literal("duplicate"), v.literal("orphaned")),
    receivedAt: v.number(),
  })
    .index("by_event_id", ["eventId"])
    .index("by_order_ref", ["orderRef"]),

  fulfillmentOutbox: defineTable({
    jobId: v.string(),
    orderRef: v.string(),
    lane: v.union(v.literal("website"), v.literal("ai_receptionist"), v.literal("maintenance")),
    status: v.union(v.literal("pending"), v.literal("leased"), v.literal("retry"), v.literal("completed"), v.literal("dead_letter")),
    attempts: v.number(),
    availableAt: v.number(),
    leaseUntil: v.optional(v.number()),
    workerId: v.optional(v.string()),
    lastErrorCode: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_job_id", ["jobId"])
    .index("by_order_ref", ["orderRef"])
    .index("by_status_available", ["status", "availableAt"])
    .index("by_status_lease", ["status", "leaseUntil"]),
});
