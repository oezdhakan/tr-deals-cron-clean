export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';

function makeSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

  const items = [
    {
      id: 1,
      source: 'manual',
      title: 'Marker Insert',
      url: 'https://example.com/marker',
      price: 0,
      currency: 'EUR',
      created_at: '2025-08-12T13:55:06.565808+00:00',
    },
  ];

  const dbLimit = Math.max(limit - items.length, 0);

  if (dbLimit > 0) {
    const supabase = makeSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('deals')
        .select('id,source,title,url,price,currency,created_at')
        .order('created_at', { ascending: false })
        .limit(dbLimit);
      if (!error && data) items.push(...data);
    }
  }

  return new Response(
    JSON.stringify({ ok: true, count: items.length, items }),
    { headers: { 'content-type': 'application/json' } }
  );
}
