import basicAuth from "../middleware/basicAuth";
import isBasicAuth from "./isBasicAuth";

export default function withAuthOrSecret(handler) {
  return (req, res) => {
    // 1) Manuelle Nutzung via Basic Auth-Header
    if (isBasicAuth(req)) {
      return basicAuth(req, res, () => handler(req, res));
    }

    // 2) Cron/Automationen via Secret (Query oder Header)
    const providedSecret = req.query?.secret || req.headers["x-cron-secret"];
    const expected = process.env.CRON_SECRET;

    if (providedSecret) {
      if (expected && providedSecret === expected) {
        return handler(req, res);
      }
      return res.status(401).json({ ok: false, message: "Invalid secret" });
    }

    // 3) Weder Basic-Auth noch Secret → Browser zum Login auffordern
    res.setHeader?.("WWW-Authenticate", 'Basic realm="Secure Area"');
    return res.status(401).json({ ok: false, message: "Auth required" });
  };
}
