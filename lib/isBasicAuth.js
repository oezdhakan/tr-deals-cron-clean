export default function isBasicAuth(req) {
  const h = req.headers?.authorization || req.headers?.Authorization;
  return typeof h === "string" && h.startsWith("Basic ");
}
