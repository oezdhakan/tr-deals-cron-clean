export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const data = [
    { title: "Mock Deal A", url: "https://example.com/a", price: 4.99,  currency: "EUR", created_at: new Date().toISOString() },
    { title: "Mock Deal B", url: "https://example.com/b", price: 12.49, currency: "EUR", created_at: new Date().toISOString() }
  ];
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" }
  });
}
