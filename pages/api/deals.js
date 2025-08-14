import withAuthOrSecret from "../../lib/withAuthOrSecret";
import { listDeals } from "../../lib/db";

async function coreHandler(req, res) {
  try {
    const { limit = "50", offset = "0" } = req.query || {};
    const data = await listDeals({ limit, offset });

    if (!data.ok) {
      return res.status(500).json({ ok: false, error: data.error || "List failed" });
    }
    return res.status(200).json({ ok: true, ...data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

export default withAuthOrSecret(coreHandler);
