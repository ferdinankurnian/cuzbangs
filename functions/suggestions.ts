async function handleSuggestion(request: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-target-url, x-proxy-target",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const urlObj = new URL(request.url);
  const query = urlObj.searchParams.get("q") || "";

  try {
    console.log(`[DEBUG] Processing query: "${query}"`);

    // 1. Parse Cookies
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

    console.log(`[DEBUG] Engine: ${selectedEngine}, CustomURL: ${customSuggestionUrl}`);

    // 2. Determine Target URL
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
          default: // google
            targetUrl = `https://www.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
        }
      }
    }

    console.log(`[DEBUG] Final Target URL: ${targetUrl}`);

    if (!targetUrl) {
      throw new Error("Target URL is null or empty");
    }

    // 3. Fetch from Upstream
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    console.log(`[DEBUG] Upstream Status: ${upstreamRes.status}`);

    if (!upstreamRes.ok) {
      const errorText = await upstreamRes.text();
      throw new Error(`Upstream returned ${upstreamRes.status}: ${errorText.substring(0, 100)}`);
    }

    const text = await upstreamRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Failed to parse Upstream JSON: ${text.substring(0, 100)}`);
    }

    // 4. Normalize Response
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
    console.error(`[ERROR] ${error.message}`);
    // Balikin info error yang detail biar bisa dibaca di Suggestion Tester
    return new Response(JSON.stringify({
      status: "error",
      message: error.message,
      query: query,
      stack: error.stack,
      requestUrl: request.url
    }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
}

export const onRequest = async (context: any) => {
  return handleSuggestion(context.request);
};

export default {
  async fetch(request: Request) {
    return handleSuggestion(request);
  }
};
