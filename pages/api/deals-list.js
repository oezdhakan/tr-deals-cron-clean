import basicAuth from "../../middleware/basicAuth";

export default function handler(req, res) {
  return basicAuth(req, res, () => {
    // 👇 Hier dein bisheriger Logik-Code
    res.status(200).json({ ok: true, route: "deals-list", auth: "passed" });
  });
}
