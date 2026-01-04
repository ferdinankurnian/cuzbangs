import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	popularity: defineTable({
		trigger: v.string(),
		hits: v.number(),
	}).index("by_trigger", ["trigger"]),
});
