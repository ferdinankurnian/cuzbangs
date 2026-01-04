import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const incrementHits = mutation({
	args: {
		triggers: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		for (const trigger of args.triggers) {
			const existing = await ctx.db
				.query("popularity")
				.withIndex("by_trigger", (q) => q.eq("trigger", trigger))
				.unique();

			if (existing) {
				await ctx.db.patch(existing._id, { hits: existing.hits + 1 });
			} else {
				await ctx.db.insert("popularity", { trigger, hits: 1 });
			}
		}
	},
});

export const getAllPopularity = query({
	args: {},
	handler: async (ctx) => {
		const all = await ctx.db.query("popularity").collect();
		// Return as an object for easy lookup: { "yt": 10, "gh": 5 }
		return all.reduce(
			(acc, curr) => {
				acc[curr.trigger] = curr.hits;
				return acc;
			},
			{} as Record<string, number>,
		);
	},
});
