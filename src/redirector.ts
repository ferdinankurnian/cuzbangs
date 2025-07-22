import { db } from './db';
import { bangs as ddgBangs } from './data/bang';

(async () => {
  const path = window.location.pathname;
  if (path !== '/go') {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const rawQuery = (params.get('q') || '').trim();

  if (!rawQuery) {
    window.location.href = '/';
    return;
  }

  // Fetch settings from Dexie
  const settingsArr = await db.settings.toArray();
  const settings = Object.fromEntries(settingsArr.map(s => [s.key, s.value]));

  const {
    'cuzbangs.default_engine': defaultEngine = 'https://duckduckgo.com/?q=%s',
    'duckduckgo.bangs_presets': ddgPresets = 'true',
    'cuzbangs.first_position_call': forceFirstBang = 'false',
    'cuzbangs.symbol_call': useCallSymbol = '!',
  } = settings;

  // Fetch user bangs from Dexie
  const bangsTabs = await db.bangs.toArray();

  const hasValidBangsTabs = Array.isArray(bangsTabs) && bangsTabs.some((b) => b?.t && b?.u);

  const userBangsMap = hasValidBangsTabs
    ? Object.fromEntries(bangsTabs.map((b) => [b.t.toLowerCase(), b]))
    : {};

  const ddgBangsMap =
    ddgPresets === 'true'
      ? Object.fromEntries(ddgBangs.map((b) => [b.t.toLowerCase(), b]))
      : {};

  const mergedBangs = {
    ...ddgBangsMap,
    ...userBangsMap,
  };

  const bangMap = Object.fromEntries(
    Object.values(mergedBangs).map((bang) => [bang.t.toLowerCase(), bang]),
  );

  const words = rawQuery.split(/\s+/);
  let detectedBang = null;
  let bangIndex = -1;

  const checkIndexes = forceFirstBang === 'true' ? [0] : words.map((_, i) => i);

  for (const i of checkIndexes) {
    const word = words[i];

    if (useCallSymbol && useCallSymbol !== 'none' && word.startsWith(useCallSymbol)) {
      const potentialBang = word.slice(useCallSymbol.length).toLowerCase();
      if (bangMap[potentialBang]) {
        detectedBang = potentialBang;
        bangIndex = i;
        break;
      }
    }

    if (!useCallSymbol || useCallSymbol === 'none') {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (bangMap[cleanWord]) {
        detectedBang = cleanWord;
        bangIndex = i;
        break;
      }
    }
  }

  let targetUrl = null;

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
      const finalQuery = queryParts.join(' ').trim();

      if (finalQuery) {
        const searchParam = encodeURIComponent(finalQuery);
        const baseUrl = matchedBang.u;

        if (baseUrl.includes('{{{s}}}')) {
          targetUrl = baseUrl.replace('{{{s}}}', searchParam);
        } else if (baseUrl.includes('%s')) {
          targetUrl = baseUrl.replace('%s', searchParam);
        } else {
          targetUrl = baseUrl;
        }
      } else {
        targetUrl = `https://${matchedBang.d}`;
      }
    }
  } else {
    targetUrl = defaultEngine.replace('%s', encodeURIComponent(rawQuery));
  }

  if (targetUrl) {
    window.location.replace(targetUrl);
  }
})();
