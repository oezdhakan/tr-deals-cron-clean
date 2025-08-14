import withAuthOrSecret from "../../lib/withAuthOrSecret";
import { upsertDeals } from "../../lib/db";
import { loadAllSources } from "../../lib/sources";

async function coreHandler(req, res) {
  try {
    // 1) Echte Quellen (ENV: DEALS_SOURCE_URLS)
    let items = await loadAllSources();

    // 2) Fallback: Wenn keine Quellen konfiguriert oder leer → 1 Dummy
    if (!items || items.length === 0) {
      items = [{
        source: "manual",
        title: "Marker Insert",
        url: "https://example.com/marker",
        price: 0,
        currency: "EUR"
      }];
    }

    const result = await upsertDeals(items);
    if (!result.ok) {
      return res.status(500).json({ ok: false, error: result.error || "Insert failed" });
    }

    return res.status(200).json({
      ok: true,
      route: "fetch-deals",
      total: items.length,
      ...result,
      triggeredAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

export default withAuthOrSecret(coreHandler);
