import { createClient } from '@supabase/supabase-js';
import { fetchDemoJson } from './fetchers/demo-json.js';
import { fetchDummyJsonProducts } from './fetchers/dummyjson-products.js';

function makeSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE env');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function runOne(s, supabase) {
  let items = [];

  // Routing nach Quelle/Typ
  if (s.type === 'api') {
    if (s.name === 'demo-json') {
      items = await fetchDemoJson(s.endpoint);
    } else if (s.name === 'dummyjson-products') {
      items = await fetchDummyJsonProducts(s.endpoint);
    }
  }
  // TODO: if (s.type === 'rss') { ... }

  if (!items?.length) {
    return { upserted: 0 };
  }

  const { data, error: upErr } = await supabase
    .from('deals')
    .upsert(items, { onConflict: 'source,url' })
    .select('id');

  if (upErr) throw upErr;

  await supabase
    .from('sources')
    .update({ last_run_at: new Date().toISOString() })
    .eq('id', s.id);

  return { upserted: data?.length || 0 };
}

export async function refreshAllSources(filterName = null) {
  const supabase = makeSupabase();

  let qry = supabase
    .from('sources')
    .select('id,name,type,endpoint,enabled')
    .eq('enabled', true);

  if (filterName) qry = qry.eq('name', filterName);

  const { data: sources, error: sErr } = await qry;
  if (sErr) throw sErr;

  let upserted = 0;
  const errors = [];

  for (const s of sources || []) {
    try {
      const r = await runOne(s, supabase);
      upserted += r.upserted;
    } catch (e) {
      errors.push({ source: s.name, error: String(e?.message || e) });
    }
  }

  return { upserted, errors };
}

export async function refreshByName(name) {
  return refreshAllSources(name);
}
