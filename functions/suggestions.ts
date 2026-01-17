// Fungsi utama yang super aman
async function handleSuggestion(request: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-target-url, x-proxy-target",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Taruh variabel di luar biar bisa diakses di catch
  let currentQuery = "";
  
  try {
    const urlObj = new URL(request.url);
    currentQuery = urlObj.searchParams.get("q") || "";
    
    // 1. Parsing Cookie yang lebih aman (manual split)
    let selectedEngine = "google";
    let customSuggestionUrl = "";
    
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(';');
      for (const cookie of cookies) {
        const [name, ...value] = cookie.trim().split('=');
        if (name === "selected_engine") selectedEngine = value.join('=');
        if (name === "custom_suggestion_url") customSuggestionUrl = decodeURIComponent(value.join('='));
      }
    }

    // 2. Tentukan target URL (Logic Fallback)
    let targetUrl = urlObj.searchParams.get("proxy_target");

    if (!targetUrl) {
      if (selectedEngine === "custom" && customSuggestionUrl) {
        targetUrl = customSuggestionUrl.replace("%s", encodeURIComponent(currentQuery));
      } else {
        switch (selectedEngine) {
          case "bing":
            targetUrl = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(currentQuery)}`;
            break;
          case "duckduckgo":
            targetUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(currentQuery)}&type=list`;
            break;
          case "kagi":
            targetUrl = `https://kagi.com/api/autosuggest?q=${encodeURIComponent(currentQuery)}`;
            break;
          default:
            targetUrl = `https://www.google.com/complete/search?client=chrome&q=${encodeURIComponent(currentQuery)}`;
        }
      }
    }

    if (!targetUrl) throw new Error("Gagal nentuin Target URL ko.");

    // 3. Nembak Upstream
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!upstreamRes.ok) {
      return new Response(JSON.stringify([currentQuery, [], { error: `Upstream error: ${upstreamRes.status}` }]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await upstreamRes.json();
    
    // 4. Normalize (Sesuai format Google)
    let suggestions: string[] = [];
    if (Array.isArray(data)) {
      if (data.length > 1 && Array.isArray(data[1])) {
        suggestions = data[1];
      } else {
        suggestions = data.filter(i => typeof i === "string");
      }
    } else if (typeof data === "object" && data !== null) {
      const d = data as any;
      if (Array.isArray(d)) {
        suggestions = d.map(i => i.phrase || i).filter(Boolean);
      } else if (d.suggestions) {
        suggestions = d.suggestions;
      }
    }

    return new Response(JSON.stringify([currentQuery, suggestions]), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });

  } catch (error: any) {
    // Kita balikin status 200 biar Suggestion Tester bisa nampilin detail error-nya
    return new Response(JSON.stringify({
      error: true,
      message: error.message,
      stack: error.stack,
      query: currentQuery
    }), {
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// Export buat Pages
export const onRequest = async (context: any) => {
  return handleSuggestion(context.request);
};

// Export buat Workers
export default {
  async fetch(request: Request) {
    return handleSuggestion(request);
  }
};