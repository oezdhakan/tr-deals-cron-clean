import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ message: 'Invalid secret' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

  const { data, error } = await supabase
    .from('deals')
    .select('id,source,title,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  // Plain-Text: eine Zeile pro Row (leicht zählbar)
  const lines = (data || []).map(
    (r) => `${r.id}\t${r.source}\t${r.title}\t${r.created_at}`
  );
  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
