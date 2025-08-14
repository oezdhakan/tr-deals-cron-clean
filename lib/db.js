// lib/db.js
let pgPool = null;

export function hasDb() {
  return !!process.env.DATABASE_URL;
}

export async function getPool() {
  if (!hasDb()) return null;
  if (!pgPool) {
    const { Pool } = await import("pg");
   pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true, rejectUnauthorized: false }
});

  }
  return pgPool;
}

/** Idempotentes Upsert nach URL (Unique). Fallback: keine DB → nur Zähler. */
export async function upsertDeals(items) {
  if (!Array.isArray(items)) items = [];
  if (!hasDb()) {
    return { ok: true, mode: "fallback", inserted: 0, updated: 0, total: items.length };
  }

  const pool = await getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id BIGSERIAL PRIMARY KEY,
        source TEXT NOT NULL,
        title  TEXT NOT NULL,
        url    TEXT NOT NULL,
        price NUMERIC,
        currency TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS deals_url_key ON deals(url);`);

    let inserted = 0, updated = 0;
    for (const it of items) {
      const { source, title, url, price = 0, currency = "EUR" } = it || {};
      if (!url) continue;
      const r = await client.query(
        `INSERT INTO deals (source, title, url, price, currency)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (url) DO UPDATE
           SET title=EXCLUDED.title, price=EXCLUDED.price, currency=EXCLUDED.currency
         RETURNING (xmax = 0) AS inserted;`,
        [source || "unknown", title || "Untitled", url, price, currency]
      );
      if (r?.rows?.[0]?.inserted) inserted++; else updated++;
    }

    await client.query("COMMIT");
    return { ok: true, mode: "db", inserted, updated, total: items.length };
  } catch (e) {
    await client.query("ROLLBACK");
    return { ok: false, error: String(e?.message || e) };
  } finally {
    client.release();
  }
}

/** Paginiertes Lesen. Fallback: Dummy, crasht nie. */
export async function listDeals({ limit = 50, offset = 0 } = {}) {
  limit = Math.min(Math.max(parseInt(limit) || 0, 1), 100);
  offset = Math.max(parseInt(offset) || 0, 0);

  if (!hasDb()) {
    return {
      ok: true,
      mode: "fallback",
      count: 1,
      items: [{
        id: 1,
        source: "manual",
        title: "Marker Insert",
        url: "https://example.com/marker",
        price: 0,
        currency: "EUR",
        created_at: "2025-08-12T13:55:06.565808+00:00"
      }]
    };
  }

  const pool = await getPool();
  const { rows } = await pool.query(
    `SELECT id, source, title, url, price, currency, created_at
     FROM deals
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return { ok: true, mode: "db", count: rows.length, items: rows };
}
