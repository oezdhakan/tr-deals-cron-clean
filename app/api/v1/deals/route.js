export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';

function makeSupabase() {
  const url = process.env.SUPABASE_URL;              // <<< nur Server-Var
  const key = process.env.SUPABASE_SERVICE_ROLE;     // <<< nur Server-Var
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}


function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 200);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);
  const source = searchParams.get('source')?.trim();
  const q = searchParams.get('q')?.trim();
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const supabase = makeSupabase();
  if (!supabase) return json({ ok: false, error: 'Missing SUPABASE_URL or KEY' }, 500);

  let query = supabase
    .from('deals')
    .select('id,source,title,url,price,currency,created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (source) query = query.eq('source', source);
  if (q) query = query.ilike('title', `%${q}%`);
  if (minPrice) query = query.gte('price', Number(minPrice));
  if (maxPrice) query = query.lte('price', Number(maxPrice));

  const from = offset;
  const to = offset + limit - 1;
  const { data, error, count } = await query.range(from, to);
  if (error) return json({ ok: false, error: error.message }, 500);

  const nextOffset = (offset + (data?.length || 0)) < (count || 0) ? offset + data.length : null;
  return json({
    ok: true,
    count: data?.length || 0,
    total: count || 0,
    nextOffset,
    items: data || [],
  });
}
