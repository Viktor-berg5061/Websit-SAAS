import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const create = internalMutation({
  args: {
    leadRef: v.string(),
    payloadJson: v.string(),
    createdAt: v.number(),
    retentionDeleteAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("websiteLeads")
      .withIndex("by_lead_ref", (q) => q.eq("leadRef", args.leadRef))
      .unique();
    if (existing) return null;
    await ctx.db.insert("websiteLeads", {
      ...args,
      source: "webbtjanst",
      status: "new",
    });
    return null;
  },
});
