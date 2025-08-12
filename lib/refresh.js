import { createClient } from '@supabase/supabase-js';
import { fetchDemoJson } from './fetchers/demoJson.js';
import { fetchDummyJsonProducts } from './fetchers/dummyJson.js';

function makeSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE env');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function refreshAllSources() {
  const supabase = makeSupabase();

  // aktivierte Quellen laden
  const { data: sources, error: sErr } = await supabase
    .from('sources')
    .select('id,name,type,endpoint,enabled')
    .eq('enabled', true);

  if (sErr) throw sErr;

  let upserted = 0;
  const errors = [];

  for (const s of (sources || [])) {
    try {
      let items = [];

      // --- Quelle auswählen ---
      if (s.type === 'api') {
        if (s.name === 'demo-json') {
          items = await fetchDemoJson(s.endpoint);
        } else if (s.name === 'dummyjson-products') {
          items = await fetchDummyJsonProducts(s.endpoint);
        }
      }
      // TODO: if (s.type === 'rss') { /* später */ }

      // --- NUR wenn Items vorhanden sind, upserten ---
      if (items && items.length) {
        const { data, error: upErr } = await supabase
          .from('deals')
          .upsert(items, { onConflict: 'source,url' })
          .select('id');

        if (upErr) throw upErr;
        upserted += data?.length || 0;

        await supabase
          .from('sources')
          .update({ last_run_at: new Date().toISOString() })
          .eq('id', s.id);
      }
    } catch (e) {
      errors.push({ source: s.name, error: String(e?.message || e) });
    }
  }

  return { upserted, errors };
}
