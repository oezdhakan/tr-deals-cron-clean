export async function GET(req) {
  return new Response("debug route ok", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
