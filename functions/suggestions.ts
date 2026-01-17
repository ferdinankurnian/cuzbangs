// Fungsi utama buat handle suggestion
async function handleSuggestion(request: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-target-url, x-proxy-target",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    
    // Ambil dari Cookie
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c: string) => {
        const parts = c.trim().split('=');
        if (parts.length < 2) return ["", ""];
        return [parts[0], parts.slice(1).join('=')];
      }).filter(p => p[0] !== "")
    );
    
    const selectedEngine = cookies["selected_engine"] || "google";
    const customSuggestionUrl = cookies["custom_suggestion_url"] ? decodeURIComponent(cookies["custom_suggestion_url"]) : "";

    let targetUrl = searchParams.get("proxy_target");

    if (!targetUrl) {
      if (selectedEngine === "custom" && customSuggestionUrl) {
        targetUrl = customSuggestionUrl.replace("%s", encodeURIComponent(query));
      } else {
        switch (selectedEngine) {
          case "bing":
            targetUrl = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}`;
            break;
          case "duckduckgo":
            targetUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`;
            break;
          case "kagi":
            targetUrl = `https://kagi.com/api/autosuggest?q=${encodeURIComponent(query)}`;
            break;
          default: // google
            targetUrl = `https://www.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
        }
      }
    }

    if (!targetUrl) throw new Error("No target URL");

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify([query, []]), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const data = await response.json();
    let suggestions: string[] = [];

    if (Array.isArray(data)) {
      if (data.length > 1 && Array.isArray(data[1])) {
        suggestions = data[1] as string[];
      } else {
        suggestions = data.filter((i: any) => typeof i === "string");
      }
    } else if (typeof data === "object" && data !== null) {
      const d = data as any;
      if (Array.isArray(d)) {
        suggestions = d.map((i: any) => i.phrase || i).filter(Boolean);
      } else if (d.suggestions) {
        suggestions = d.suggestions;
      }
    }

    return new Response(JSON.stringify([query, suggestions]), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify(["", [], { error: error.message }]), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Support for Cloudflare Pages
export const onRequest = async (context: any) => {
  return handleSuggestion(context.request);
};

// Support for standard Cloudflare Workers (export default)
export default {
  async fetch(request: Request) {
    return handleSuggestion(request);
  }
};