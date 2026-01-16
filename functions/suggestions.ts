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
    // Kita balikin format standar Google: ["query", ["suggestion1", "suggestion2"]]
    let suggestions: string[] = [];

    if (Array.isArray(data)) {
      if (Array.isArray(data[1])) {
        suggestions = data[1]; // Google/Bing format
      } else {
        suggestions = data.filter(i => typeof i === "string");
      }
    } else if (typeof data === "object" && data !== null) {
      // Handle DuckDuckGo format [{"phrase": "..."}]
      if (Array.isArray(data)) {
        suggestions = data.map(i => i.phrase || i).filter(Boolean);
      } else if (data.suggestions) {
        suggestions = data.suggestions;
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
