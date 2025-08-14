import withAuthOrSecret from "../../lib/withAuthOrSecret";
import { getPool, hasDb } from "../../lib/db";

async function coreHandler(req, res) {
  const envSeen = hasDb();
  try {
    const pool = await getPool(); // nutzt ssl: { rejectUnauthorized: false }
    if (!pool) return res.status(200).json({ ok: false, hasEnv: envSeen, error: "No DATABASE_URL" });
    const r = await pool.query("select now() as ts");
    return res.status(200).json({ ok: true, hasEnv: envSeen, pgNow: r?.rows?.[0]?.ts || null });
  } catch (e) {
    return res.status(500).json({ ok: false, hasEnv: envSeen, error: String(e?.message || e) });
  }
}

export default withAuthOrSecret(coreHandler);
