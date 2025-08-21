// src/Bangs.tsx
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { bangs as ddgBangs } from "../data/bang";
import { useBangsContext } from "../context/BangsContext";
import { Loader2 } from "lucide-react";

const BangsHandler = () => {
  const location = useLocation();
  const { defaultEngine, ddgPresets, forceFirstBang, useCallSymbol } =
    useSettings();
  const { bangsTabs } = useBangsContext();

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

    const mergedBangs = {
      ...ddgBangsMap,
      ...userBangsMap,
    };

    return Object.values(mergedBangs);
  }, [ddgPresets, bangsTabs, hasValidBangsTabs]);

  const bangMap = useMemo(
    () =>
      Object.fromEntries(
        activeBangs.map((bang) => [bang.t.toLowerCase(), bang]),
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

      if (useCallSymbol && word.startsWith(useCallSymbol)) {
        const potentialBang = word.slice(useCallSymbol.length).toLowerCase();
        if (bangMap[potentialBang]) {
          detectedBang = potentialBang;
          bangIndex = i;
          break;
        }
      }

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
      const matchedBang = bangMap[detectedBang];
      let isJustCall = false;
      if (Array.isArray(bangsTabs)) {
        const userBang = bangsTabs.find(b => b.t.toLowerCase() === detectedBang);
        isJustCall = !!(userBang && userBang.jc === true);
      }

      if (isJustCall) {
        targetUrl = matchedBang.u;
      } else {
        const queryParts = [...words];
        queryParts.splice(bangIndex, 1);
        const finalQuery = queryParts.join(" ").trim();

        if (finalQuery) {
          const searchParam = encodeURIComponent(finalQuery);
          const baseUrl = matchedBang.u;

          if (baseUrl.includes("{{{s}}}")) {
            targetUrl = baseUrl.replace("{{{s}}}", searchParam);
          } else if (baseUrl.includes("%s")) {
            targetUrl = baseUrl.replace("%s", searchParam);
          } else {
            targetUrl = baseUrl;
          }
        } else {
          targetUrl = `https://${matchedBang.d}`;
        }
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
    bangsTabs,
  ]);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-background z-50">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );
};

export default BangsHandler;
