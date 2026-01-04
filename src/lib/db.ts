import Dexie, { type Table } from "dexie";
import { z } from "zod";

const TriggerSchema = z.preprocess(
	(val) => (Array.isArray(val) ? val : [val]),
	z.array(z.string()),
);

export const BangSubRouteSchema = z.object({
	t: TriggerSchema,
	u: z.string(),
	su: z.string().optional(),
	desc: z.string().optional(),
});

export type BangSubRoute = z.infer<typeof BangSubRouteSchema>;

export const BangEntrySchema = z.object({
	id: z.number().optional(),
	t: TriggerSchema,
	s: z.string(),
	u: z.string(),
	r: z.number().default(0),
	d: z.string(),
	c: z.string().optional(),
	sc: z.string().optional(),
	su: z.string().optional(),
	desc: z.string().optional(),
	sr: z.array(BangSubRouteSchema).optional(),
	isCustom: z.boolean().default(false),
});

export const PingSchema = z.object({
	id: z.number().optional(),
	t: z.string(), // trigger
	ts: z.number(), // timestamp
});

export type Ping = z.infer<typeof PingSchema>;

export type BangEntry = z.infer<typeof BangEntrySchema>;

export const AppConfigSchema = z.object({
	id: z.number().optional(),
	selectedEngine: z.string(),
	customUrl: z.string(),
	selectedSymbol: z.string(),
	forceBangsFirst: z.boolean(),
	useStoreBangs: z.boolean(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export class cuzbangsDB extends Dexie {
	storeBangs!: Table<BangEntry>;
	userBangs!: Table<BangEntry>;
	configs!: Table<AppConfig>;
	pings!: Table<Ping>;

	constructor() {
		super("cuzbangsDB");
		this.version(1).stores({
			storeBangs: "++id, *t, s, d, c, r",
			userBangs: "++id, *t, s, d, c, r",
			configs: "++id",
			pings: "++id, t",
		});
	}
}

export const db = new cuzbangsDB();
