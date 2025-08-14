import withAuthOrSecret from "../../lib/withAuthOrSecret";

async function coreHandler(req, res) {
  // Smoke-Test: nur OK zurückgeben
  return res.status(200).json({ ok: true, route: "fetch-deals" });
}

export default withAuthOrSecret(coreHandler);
