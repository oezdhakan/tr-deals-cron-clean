// lib/sources.js
import { fetchJson } from "./http.js";

/**
 * Liest eine kommaseparierte Liste von URLs aus ENV: DEALS_SOURCE_URLS
 * Beispiel: https://dummyjson.com/products?limit=3,https://example.com/deals.json
 */
function getConfiguredUrls() {
  const raw = process.env.DEALS_SOURCE_URLS || "";
  return raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Primitive Normalisierer:
 * - Wenn JSON { products: [...] } (z.B. dummyjson.com), mappe auf Deals-Schema
 * - Wenn JSON Array von { title,url,price,currency }, nimm direkt diese Felder
 */
function normalizeToDeals(json, sourceLabel = "remote") {
  const out = [];
  if (!json) return out;

  // Fall A: DummyJSON-ähnlich
  if (Array.isArray(json.products)) {
    for (const p of json.products) {
      if (!p) continue;
      const id = p.id ?? p.slug ?? p.title;
      const url = `https://dummyjson.com/products/${id}`;
      out.push({
        source: sourceLabel,
        title: String(p.title ?? "Untitled"),
        url,
        price: Number(p.price ?? 0),
        currency: "USD",
      });
    }
    return out;
  }

  // Fall B: Bereits im Deals-Format
  if (Array.isArray(json)) {
    for (const it of json) {
      if (!it?.url) continue;
      out.push({
        source: it.source ?? sourceLabel,
        title: String(it.title ?? "Untitled"),
        url: String(it.url),
        price: Number(it.price ?? 0),
        currency: String(it.currency ?? "EUR"),
      });
    }
    return out;
  }

  return out;
}

export async function loadAllSources() {
  const urls = getConfiguredUrls();
  const all = [];

  for (const url of urls) {
    try {
      const json = await fetchJson(url);
      const items = normalizeToDeals(json, new URL(url).hostname);
      all.push(...items);
    } catch (e) {
      // Quelle fällt aus → einfach weiter; Stabilität > Perfektion
      // Optional: hier später Logging ergänzen
    }
  }

  return all;
}
