// src/Bangs.tsx
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "./context/SettingsContext";
import { bangs as ddgBangs } from "./data/bang";
import { useBangsContext } from "./context/BangsContext";
import { Loader2 } from "lucide-react";

const BangsHandler = () => {
  const location = useLocation();
  const { defaultEngine, ddgPresets, forceFirstBang, useCallSymbol } =
    useSettings();
  const { bangsTabs } = useBangsContext();

  // --- Prioritaskan bangsTabs dari context ---
  const hasValidBangsTabs =
    Array.isArray(bangsTabs) && bangsTabs.some((b) => b?.t && b?.u);

  const activeBangs = useMemo(() => {
    const userBangsMap = hasValidBangsTabs
      ? Object.fromEntries(bangsTabs.map((b) => [b.t.toLowerCase(), b]))
      : {};

    const ddgBangsMap =
      ddgPresets === "true"
        ? Object.fromEntries(ddgBangs.map((b) => [b.t.toLowerCase(), b]))
        : {};

    // Merge dan prioritaskan userBangs
    const mergedBangs = {
      ...ddgBangsMap,
      ...userBangsMap, // override
    };

    return Object.values(mergedBangs);
  }, [ddgPresets, bangsTabs, hasValidBangsTabs]);

  const bangMap = useMemo(
    () =>
      Object.fromEntries(
        activeBangs.map((bang) => [bang.t.toLowerCase(), bang.u]),
      ),
    [activeBangs],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let rawQuery: string;
    try {
      rawQuery = decodeURIComponent(params.get("q") || "").trim();
    } catch (error) {
      if (error instanceof URIError) {
        rawQuery = (params.get("q") || "").trim();
      } else {
        throw error;
      }
    }

    if (!rawQuery) {
      if (location.pathname === "/go" || location.pathname === "/") {
        window.location.href = "/";
      }
      return;
    }

    const words = rawQuery.split(/\s+/);
    let detectedBang: string | null = null;
    let bangIndex = -1;

    const checkIndexes =
      forceFirstBang === "true" ? [0] : words.map((_, i) => i);

    for (const i of checkIndexes) {
      const word = words[i];

      // 1. If a call symbol is defined (e.g. !, @, #, $, /) check for that prefix
      if (useCallSymbol && word.startsWith(useCallSymbol)) {
        const potentialBang = word.slice(useCallSymbol.length).toLowerCase();
        if (bangMap[potentialBang]) {
          detectedBang = potentialBang;
          bangIndex = i;
          break;
        }
      }

      // 2. Fallback: if the configured symbol is NOT mandatory (i.e. plain word calls)
      //    we allow matching without any prefix. This behaviour mirrors the previous
      //    implementation when `useCallSymbol` was set to a non-exclamation value.
      if (!useCallSymbol || useCallSymbol === "none") {
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        if (bangMap[cleanWord]) {
          detectedBang = cleanWord;
          bangIndex = i;
          break;
        }
      }
    }

    let targetUrl: string | null = null;

    if (detectedBang && bangMap[detectedBang]) {
      const queryParts = [...words];
      queryParts.splice(bangIndex, 1); // remove bang word
      const finalQuery = queryParts.join(" ").trim();
      const searchParam = encodeURIComponent(finalQuery);
      const baseUrl = bangMap[detectedBang];

      if (baseUrl.includes("{{{s}}}")) {
        targetUrl = baseUrl.replace("{{{s}}}", searchParam);
      } else if (baseUrl.includes("%s")) {
        targetUrl = baseUrl.replace("%s", searchParam);
      } else {
        targetUrl = baseUrl; // fallback, gak ada parameter
      }
    } else {
      targetUrl = defaultEngine.replace("%s", encodeURIComponent(rawQuery));
    }

    if (targetUrl) {
      window.location.replace(targetUrl);
    }
  }, [
    location.search,
    location.pathname,
    defaultEngine,
    ddgPresets,
    forceFirstBang,
    useCallSymbol,
    bangMap,
  ]);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-background z-50">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );
};

export default BangsHandler;
