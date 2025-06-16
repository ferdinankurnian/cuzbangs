// src/Bangs.tsx
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "./context/SettingsContext";
import { bangs as ddgBangs } from "./data/bang";
import { useBangsContext } from "./context/BangsContext";
import { Loader2 } from "lucide-react";

const BangsHandler = () => {
  const location = useLocation();
  const { defaultEngine, ddgPresets, forceFirstBang, callExclamation } =
    useSettings();
  const { bangsTabs } = useBangsContext();

  // --- Prioritaskan bangsTabs dari context ---
  const activeBangs = useMemo(() => {
    if (bangsTabs.length > 0) {
      return bangsTabs; // custom user punya? gaskeun
    }

    if (ddgPresets === "true") {
      return ddgBangs; // preset aktif dan custom kosong → pake bawaan
    }

    return []; // fallback kosong → berarti pake default search engine aja
  }, [ddgPresets, bangsTabs]);

  const bangMap = useMemo(
    () =>
      Object.fromEntries(
        activeBangs.map((bang) => [bang.t.toLowerCase(), bang.u]),
      ),
    [activeBangs],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawQuery = decodeURIComponent(params.get("q") || "").trim();

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

      if (callExclamation === "true") {
        if (word.startsWith("!")) {
          const potentialBang = word.slice(1).toLowerCase();
          if (bangMap[potentialBang]) {
            detectedBang = potentialBang;
            bangIndex = i;
            break;
          }
        }
      } else {
        if (!word.startsWith("!")) {
          const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          if (bangMap[cleanWord]) {
            detectedBang = cleanWord;
            bangIndex = i;
            break;
          }
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
    callExclamation,
    bangMap,
  ]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 120,
      }}
    >
      <Loader2 className="animate-spin" size={32} />
    </div>
  );
};

export default BangsHandler;
