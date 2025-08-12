export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { refreshByName } from '../../../lib/refresh.js';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

export async function GET(req) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  const source = url.searchParams.get('source'); // z.B. demo-json | dummyjson-products

  if (secret !== process.env.CRON_SECRET) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }
  if (!source) {
    return json({ ok: false, error: 'Missing ?source=' }, 400);
  }

  try {
    const result = await refreshByName(source);
    return json({ ok: true, source, ...result, time: new Date().toISOString() });
  } catch (e) {
    return json({ ok: false, source, error: String(e?.message || e) }, 500);
  }
}
