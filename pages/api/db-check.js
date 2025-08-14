import withAuthOrSecret from "../../lib/withAuthOrSecret";
import { listDeals } from "../../lib/db";

async function coreHandler(req, res) {
  const hasEnv = Boolean(process.env.DATABASE_URL);
  try {
    const data = await listDeals({ limit: 1, offset: 0 });
    return res.status(200).json({
      ok: true,
      hasEnv,
      mode: data.mode,
      sample: data.items?.[0] ?? null
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      hasEnv,
      error: String(err?.message || err)
    });
  }
}

export default withAuthOrSecret(coreHandler);
