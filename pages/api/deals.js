import withAuthOrSecret from "../../lib/withAuthOrSecret";

async function coreHandler(req, res) {
  try {
    // 🔽 HIER deine echte Logik (z.B. DB read der gespeicherten Deals)
    // const rows = await listDeals();
    // return res.status(200).json({ ok: true, count: rows.length, items: rows });

    // Temporär:
    return res.status(200).json({ ok: true, route: "deals", mode: "real-logic-todo" });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

export default withAuthOrSecret(coreHandler);
