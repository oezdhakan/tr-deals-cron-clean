export default function basicAuth(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
    return res.status(401).json({ ok: false, error: "Auth required" });
  }

  // "Basic base64(user:pass)" dekodieren
  const [, base64] = auth.split(" ");
  const [user, pass] = Buffer.from(base64, "base64").toString().split(":");

  // Erwartete Werte aus ENV
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPass = process.env.BASIC_AUTH_PASS;

  if (user === expectedUser && pass === expectedPass) {
    return next(); // ✅ Weiter zur API-Route
  }

  return res.status(403).json({ ok: false, error: "Invalid credentials" });
}
