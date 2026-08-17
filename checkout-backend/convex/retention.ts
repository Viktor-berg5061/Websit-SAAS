import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const MAX_DELETE_PER_RUN = 25;

export const purgeExpiredOrders = internalMutation({
  args: {},
  returns: v.object({ deletedOrders: v.number(), deletedLeads: v.number() }),
  handler: async (ctx) => {
    const now = Date.now();
    const orders = await ctx.db
      .query("checkoutOrders")
      .withIndex("by_retention", (q) => q.lte("retentionDeleteAt", now))
      .take(MAX_DELETE_PER_RUN);

    for (const order of orders) {
      const jobs = await ctx.db
        .query("fulfillmentOutbox")
        .withIndex("by_order_ref", (q) => q.eq("orderRef", order.orderRef))
        .collect();
      for (const job of jobs) await ctx.db.delete(job._id);

      const events = await ctx.db
        .query("stripeEvents")
        .withIndex("by_order_ref", (q) => q.eq("orderRef", order.orderRef))
        .collect();
      for (const event of events) await ctx.db.delete(event._id);

      await ctx.db.delete(order._id);
    }

    const leads = await ctx.db
      .query("websiteLeads")
      .withIndex("by_retention", (q) => q.lte("retentionDeleteAt", now))
      .take(MAX_DELETE_PER_RUN);
    for (const lead of leads) await ctx.db.delete(lead._id);

    return { deletedOrders: orders.length, deletedLeads: leads.length };
  },
});
