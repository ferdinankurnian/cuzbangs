import Dexie, { type Table } from "dexie";

export interface Setting {
  id?: number;
  key: string;
  value: string;
}

export interface DuckDuckGoBangs {
  id?: number;
  c: string; // category alias
  d: string; // domain website
  r: number; // ranking
  s: string; // short name
  sc: string; // short category description
  t: string; // Shortcut/Trigger keyword, contoh "gh" (ini yang kita cari: !gh)
  u: string; // URL template, contoh "https://github.com/search?q={{s}}"
}

export interface Bangs {
  id?: number;
  s: string; // bangs name
  t: string; // Shortcut/Trigger keyword, contoh "t3" (ini yang kita cari: !t3)
  u: string; // URL template, contoh "https://www.t3.chat/new?q={{{s}}}"
}

class cuzbangsDB extends Dexie {
  settings!: Table<Setting, number>;
  bangs!: Table<Bangs, number>;
  ddgbangs!: Table<DuckDuckGoBangs, number>;

  constructor() {
    super("cuzbangsDB");

    this.version(1).stores({
      settings: "++id, key, value",
      bangs: "++id, t",
      ddgbangs: "++id, t",
    });

    // Ini yang bener buat seed data
    this.on("populate", () => {
      this.settings.bulkAdd([
        { key: "cuzbangs.default_engine", value: "google" },
        { key: "cuzbangs.exclamation_call", value: "true" },
        { key: "cuzbangs.first_position_call", value: "false" },
        { key: "duckduckgo.bangs_presets", value: "true" },
      ]);
    });
  }
}

export const db = new cuzbangsDB();
