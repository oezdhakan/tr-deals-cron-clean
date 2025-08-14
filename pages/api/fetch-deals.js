import withAuthOrSecret from "../../lib/withAuthOrSecret";
import { upsertDeals } from "../../lib/db";

// Dummy-Quelle (später durch echte Quellen ersetzen)
async function fetchFromSources() {
  return [
    {
      source: "manual",
      title: "Marker Insert",
      url: "https://example.com/marker",
      price: 0,
      currency: "EUR"
    }
  ];
}

async function coreHandler(req, res) {
  try {
    const items = await fetchFromSources();
    const result = await upsertDeals(items);

    if (!result.ok) {
      return res.status(500).json({ ok: false, error: result.error || "Insert failed" });
    }

    return res.status(200).json({
      ok: true,
      route: "fetch-deals",
      ...result,
      triggeredAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

export default withAuthOrSecret(coreHandler);
