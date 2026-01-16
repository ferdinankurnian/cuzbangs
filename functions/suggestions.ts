// Definisi tipe minimal buat Cloudflare Pages Functions
type PagesFunction<Env = any> = (context: EventContext<Env, any, any>) => Response | Promise<Response>;

interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

export const onRequest: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const query = searchParams.get("q");
  const proxyTarget = searchParams.get("proxy_target");

  if (!query || !proxyTarget) {
    return new Response(JSON.stringify([query || "", []]), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await fetch(proxyTarget, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) throw new Error("Upstream Error");

    const data = await response.json();
    
    // Normalize response biar address bar browser ga bingung
    let suggestions: string[] = [];

    // Validasi tipe data yang aman
    if (Array.isArray(data)) {
      if (data.length > 1 && Array.isArray(data[1])) {
        suggestions = data[1] as string[]; // Google/Bing format
      } else {
        suggestions = data.filter((i): i is string => typeof i === "string");
      }
    } else if (typeof data === "object" && data !== null) {
      // Handle DuckDuckGo format
      const ddgData = data as any;
      if (Array.isArray(ddgData)) {
        suggestions = ddgData.map((i: any) => i.phrase || i).filter(Boolean);
      } else if (ddgData.suggestions) {
        suggestions = ddgData.suggestions;
      }
    }

    return new Response(JSON.stringify([query, suggestions]), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify([query, []]), {
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*" 
      },
    });
  }
};