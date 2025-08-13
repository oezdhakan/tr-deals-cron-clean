import withAuthOrSecret from "../../lib/withAuthOrSecret";

function coreHandler(req, res) {
  // 👉 Hier kommt (später) deine echte Logik hin
  return res.status(200).json({ ok: true, route: "deals-list" });
}

export default withAuthOrSecret(coreHandler);
