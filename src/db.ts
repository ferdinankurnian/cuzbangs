import Dexie, { type Table } from "dexie";

export interface Setting {
  id?: number;
  key: string;
  value: string;
}

export interface Bangs {
  id?: number;
  d: string;
  s: string; // bangs name
  t: string; // Shortcut/Trigger keyword, contoh "t3" (ini yang kita cari: !t3)
  u: string; // URL template, contoh "https://www.t3.chat/new?q={{{s}}}"
}

class cuzbangsDB extends Dexie {
  settings!: Table<Setting, string>;
  bangs!: Table<Bangs, number>;

  constructor() {
    super("cuzbangsDB");

    this.version(1).stores({
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
        { key: "cuzbangs.exclamation_call", value: "true" },
        { key: "cuzbangs.first_position_call", value: "false" },
        { key: "duckduckgo.bangs_presets", value: "true" },
      ]);
    });
  }
}

export const db = new cuzbangsDB();
