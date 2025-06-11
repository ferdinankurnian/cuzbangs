// src/Bangs.tsx
import { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const DEFAULT_SEARCH_ENGINE = "https://www.bing.com/search?&q=";

const BANG_MAPPING: { [key: string]: string } = {
  "!gh": "https://github.com/search?q=",
  "!wiki": "https://en.wikipedia.org/w/index.php?search=",
  "!yt": "https://www.youtube.com/results?search_query=",
  "!ddg": "https://duckduckgo.com/?q=",
  "!b": "https://www.bing.com/search?&q=",
  "!c": "https://chatgpt.com/?q=",
  // Tambahin bang lain di sini ya, Ferdinan!
};

const BangsHandler = () => {
  const location = useLocation();

  // State untuk opsi 'force bangs call on first place'
  // Defaultnya false, artinya bisa deteksi di mana saja
  const [forceBangOnFirstPlace] = useState(false);
  // Kamu bisa pakai ini di komponen settings nanti
  // contoh kalau mau di-set ke true secara default

  useEffect(() => {
    let rawQuery = "";

    const params = new URLSearchParams(location.search);
    if (params.has("q")) {
      rawQuery = params.get("q")!;
    } else {
      console.log(
        'No "q" query parameter found. Staying on this page or redirecting.',
      );
      if (location.pathname === "/go" || location.pathname === "/") {
        window.location.href = "/";
      }
      return;
    }

    rawQuery = decodeURIComponent(rawQuery);
    console.log("Final Raw Query to process:", rawQuery);

    let targetUrl: string | null = null; // Inisialisasi dengan null
    let bangFound = false;

    // ----------------------------------------------------
    // Logic DETEKSI BANGS DI MANA SAJA atau HANYA DI DEPAN
    // ----------------------------------------------------

    if (forceBangOnFirstPlace) {
      const parts = rawQuery.split(/\s+/);
      const firstPart = parts[0];

      if (firstPart.startsWith("!") && BANG_MAPPING[firstPart]) {
        const bang = firstPart;
        const query = parts.slice(1).join(" ").trim();
        targetUrl = `${BANG_MAPPING[bang]}${encodeURIComponent(query)}`;
        bangFound = true;
        console.log(
          "Force Bang on First Place: Bang found and processed. Target:",
          targetUrl,
        );
      } else {
        console.log(
          "Force Bang on First Place: No valid bang at the beginning.",
        );
      }
    } else {
      // Logic BARU: Deteksi Bangs di mana saja
      const words = rawQuery.split(/\s+/);
      let detectedBang = null;
      let bangIndex = -1;

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word.startsWith("!") && BANG_MAPPING[word]) {
          detectedBang = word;
          bangIndex = i;
          break;
        }
      }

      if (detectedBang) {
        bangFound = true;
        console.log("Bangs Anywhere: Detected Bang:", detectedBang);

        const queryParts = [...words];
        queryParts.splice(bangIndex, 1); // Hapus bang dari daftar kata
        const remainingQuery = queryParts.join(" ").trim(); // Gabungkan sisa kata jadi query

        if (!remainingQuery) {
          // Kalau setelah hapus bang, query-nya jadi kosong, misal cuma '!yt'
          if (detectedBang === "!yt") {
            targetUrl = "https://www.youtube.com/"; // Redirect ke homepage YouTube
            console.log(
              "Bangs Anywhere: Redirecting to YouTube homepage as query is empty.",
            );
          } else {
            targetUrl = `${BANG_MAPPING[detectedBang]}`; // Atau ke base URL
            console.warn(
              "Bangs Anywhere: Empty query for bang, redirecting to base URL.",
            );
          }
        } else {
          // INI BAGIAN KRITISNYA: AssigntargetUrl di sini!
          targetUrl = `${BANG_MAPPING[detectedBang]}${encodeURIComponent(remainingQuery)}`;
          console.log("Bangs Anywhere: Generated target URL:", targetUrl);
        }
      } else {
        console.log("Bangs Anywhere: No valid bang found in query.");
      }
    }

    // ----------------------------------------------------
    // Fallback kalau tidak ada bang atau targetUrl masih null
    // ----------------------------------------------------
    if (!bangFound || !targetUrl) {
      // Pastikan targetUrl sudah punya nilai kalau bangFound
      targetUrl = `${DEFAULT_SEARCH_ENGINE}${encodeURIComponent(rawQuery)}`;
      console.log(
        "Falling back to default search engine. Final Target:",
        targetUrl,
      );
    }

    if (targetUrl) {
      console.log("Executing redirect to:", targetUrl);
      window.location.replace(targetUrl);
    }
  }, [location.search, location.pathname, forceBangOnFirstPlace]); // Dependensi: hanya re-run kalau search atau pathname berubah

  return (
    <div>
      <h1>Processing your search...</h1>
      <p>If you are not redirected automatically, please check your query.</p>
    </div>
  );
};

export default BangsHandler;
