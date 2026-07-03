import Dexie, { type Table } from "dexie";
import { z } from "zod";

const TriggerSchema = z.preprocess(
	(val) => (Array.isArray(val) ? val : [val]),
	z.array(z.string()),
);

const SubrouteSchema = z.object({
	t: TriggerSchema,
	s: z.string(),
	u: z.string(),
	b: z.string(),
	d: z.string().optional(),
	c: z.string().optional(),
	sc: z.string().optional(),
	su: z.string().optional(),
	desc: z.string().optional(),
});

export const BangEntrySchema = z.object({
	id: z.number().optional(),
	t: TriggerSchema,
	s: z.string(),
	u: z.string(),
	d: z.string(),
	c: z.string().optional(),
	sc: z.string().optional(),
	su: z.string().optional(),
	desc: z.string().optional(),
	sr: z.array(SubrouteSchema).optional(),
	isCustom: z.boolean().default(false),
	presetSource: z.enum(["kagi", "cuzbangs"]).optional(),
});

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
	useKagiPrivacy: boolean;
	customSuggestionUrl: string;
};

export const SETTING_KEYS = {
	ENGINE: "cuzbangs.default_engine",
	CUSTOM_URL: "cuzbangs.custom_url",
	SYMBOL: "cuzbangs.symbol_call",
	FORCE_FIRST: "cuzbangs.first_position_call",
	USE_STORE: "cuzbangs.use_storebangs",
	KAGI_PRIVACY: "useKagiPrivacy",
	CUSTOM_SUGGESTION_URL: "customSuggestionUrl",
} as const;

export class cuzbangsDB extends Dexie {
	storeBangs!: Table<BangEntry>;
	userBangs!: Table<BangEntry>;
	settings!: Table<Setting>;

	constructor() {
		super("cuzbangsDB");
		this.version(1).stores({
			storeBangs: "++id, *t, s, d, c",
			userBangs: "++id, *t, s, d, c",
			settings: "key",
		});
	}
}

export const db = new cuzbangsDB();
