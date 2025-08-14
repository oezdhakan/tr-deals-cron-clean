import withAuthOrSecret from "../../lib/withAuthOrSecret";

async function coreHandler(req, res) {
  try {
    // Beispiel: hier deine echte DB-Lese-Logik einfügen
    // const deals = await db.getDeals();
    // return res.status(200).json({ ok: true, count: deals.length, items: deals });

    // Temporär für Test:
    return res.status(200).json({
      ok: true,
      route: "deals",
      mode: "real-logic-placeholder"
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: String(err?.message || err)
    });
  }
}

export default withAuthOrSecret(coreHandler);
