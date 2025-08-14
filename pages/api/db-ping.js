import withAuthOrSecret from "../../lib/withAuthOrSecret";

async function coreHandler(req, res) {
  const hasEnv = Boolean(process.env.DATABASE_URL);
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const r = await pool.query("select now() as ts");
    await pool.end();
    return res.status(200).json({ ok: true, hasEnv, pgNow: r?.rows?.[0]?.ts || null });
  } catch (e) {
    return res.status(500).json({ ok: false, hasEnv, error: String(e?.message || e) });
  }
}

export default withAuthOrSecret(coreHandler);
