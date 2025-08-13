import basicAuth from "../middleware/basicAuth";
import isBasicAuth from "./isBasicAuth";

export default function withAuthOrSecret(handler) {
  return (req, res) => {
    // 1) Manuelle Tests per Basic Auth (Browser/Postman/curl)
    if (isBasicAuth(req)) {
      return basicAuth(req, res, () => handler(req, res));
    }

    // 2) Cron/Automations via Secret (Query oder Header)
    const secret = req.query?.secret || req.headers["x-cron-secret"];
    const expected = process.env.CRON_SECRET;

    if (!expected || secret !== expected) {
      return res.status(401).json({ ok: false, message: "Invalid secret" });
    }

    return handler(req, res);
  };
}
