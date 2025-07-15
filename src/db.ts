import Dexie, { type Table } from "dexie";

export interface Setting {
  id?: number;
  key: string;
  value: string;
}

export interface Bangs {
  id?: number;
  d: string;
  s: string;
  t: string;
  u: string;
  jc: boolean;
}

class cuzbangsDB extends Dexie {
  settings!: Table<Setting, string>;
  bangs!: Table<Bangs, number>;

  constructor() {
    super("cuzbangsDB");

    this.version(2).stores({
      settings: "&key, value",
      bangs: "++id, t",
    });

    // Ini yang bener buat seed data
    this.on("populate", () => {
      this.settings.bulkAdd([
        {
          key: "cuzbangs.default_engine",
          value: "https://www.google.com/search?q=%s",
        },
        { key: "cuzbangs.symbol_call", value: "!" },
        { key: "cuzbangs.first_position_call", value: "false" },
        { key: "duckduckgo.bangs_presets", value: "true" },
      ]);
      this.bangs.bulkAdd([
        {
          d: "cuzbangs.vercel.app",
          s: "cuzbangs",
          t: "cuzbangs",
          u: "https://cuzbangs.vercel.app/",
          jc: true,
        },
        {
          d: "chatgpt.com",
          s: "ChatGPT",
          t: "c",
          u: "https://chatgpt.com/?q=%s",
          jc: false,
        },
        {
          d: "claude.ai",
          s: "Claude",
          t: "cl",
          u: "https://claude.ai/new/?q=%s",
          jc: false,
        },
      ]);
    });
  }
}

export const db = new cuzbangsDB();
