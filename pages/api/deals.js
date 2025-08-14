import withAuthOrSecret from "../../lib/withAuthOrSecret";

async function coreHandler(req, res) {
  // TODO: echte Logik
  return res.status(200).json({ ok: true, route: "deals" });
}

export default withAuthOrSecret(coreHandler);
