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

export const SettingSchema = z.object({
	key: z.string(),
	value: z.any(),
});

export type Setting = z.infer<typeof SettingSchema>;

export type AppConfig = {
	selectedEngine: string;
	customUrl: string;
	selectedSymbol: string;
	forceBangsFirst: boolean;
	useStoreBangs: boolean;
	enablePopularity: boolean;
};

export const SETTING_KEYS = {
	ENGINE: "cuzbangs.default_engine",
	CUSTOM_URL: "cuzbangs.custom_url",
	SYMBOL: "cuzbangs.symbol_call",
	FORCE_FIRST: "cuzbangs.first_position_call",
	USE_STORE: "cuzbangs.use_storebangs",
	POPULARITY: "cuzbangs.enable_popularity",
} as const;

export class cuzbangsDB extends Dexie {
	storeBangs!: Table<BangEntry>;
	userBangs!: Table<BangEntry>;
	settings!: Table<Setting>;
	pings!: Table<Ping>;

	constructor() {
		super("cuzbangsDB");
		this.version(1).stores({
			storeBangs: "++id, *t, s, d, c, r",
			userBangs: "++id, *t, s, d, c, r",
			settings: "key",
			pings: "++id, t",
		});
	}
}

export const db = new cuzbangsDB();
