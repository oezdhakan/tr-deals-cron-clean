export async function GET() {
  return new Response(JSON.stringify({ ok: true, route: "/api/v1/deals" }), {
    headers: { "content-type": "application/json" },
  });
}
