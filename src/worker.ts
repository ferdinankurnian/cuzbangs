import suggestionsHandler from "../functions/suggestions";

export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // 1. Route ke Suggestions
    if (url.pathname === "/suggestions") {
      // Kita panggil fungsi fetch dari suggestions.ts yang udah kita buat universal tadi
      return (suggestionsHandler as any).fetch(request);
    }

    // 2. Fallback ke Static Assets
    return env.ASSETS.fetch(request);
  },
};