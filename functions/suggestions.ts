export async function handleSuggestion(request: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-target-url, x-proxy-target",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const urlObj = new URL(request.url);
    const query = urlObj.searchParams.get("q") || "";
    
    // Cookie Parsing
    let selectedEngine = "google";
    let customSuggestionUrl = "";
    
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      for (const cookie of cookieHeader.split(';')) {
        const [name, ...value] = cookie.trim().split('=');
        if (name === "selected_engine") selectedEngine = value.join('=');
        if (name === "custom_suggestion_url") customSuggestionUrl = decodeURIComponent(value.join('='));
      }
    }

    // Determine Target URL
    let targetUrl = urlObj.searchParams.get("proxy_target");

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
          default:
            targetUrl = `https://www.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
        }
      }
    }

    if (!targetUrl) return new Response(JSON.stringify([query, []]), { headers: corsHeaders });

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

    // Normalize Response
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

  } catch (error) {
    return new Response(JSON.stringify(["", []]), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Support for Pages & Workers
export const onRequest = async (context: any) => handleSuggestion(context.request);
export default {
  fetch: (request: Request) => handleSuggestion(request)
};
