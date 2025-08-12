export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const hasServerUrl = !!process.env.SUPABASE_URL;
  const hasServerKey = !!process.env.SUPABASE_SERVICE_ROLE;
  const hasPublicUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasPublicKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return new Response(JSON.stringify({
    ok: true,
    hasServerUrl,
    hasServerKey,
    hasPublicUrl,
    hasPublicKey
  }), { headers: { 'content-type': 'application/json' }});
}
