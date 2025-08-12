export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Relativer Import (Option A)
import { refreshAllSources } from '../../../../lib/refresh';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function isAuthorized(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  const qsSecret = new URL(req.url).searchParams.get('secret');
  const expect = process.env.CRON_SECRET;
  return token === expect || qsSecret === expect;
}

async function handle() {
  try {
    const result = await refreshAllSources();
    return json({ ok: true, ...result });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
}

export async function POST(req) {
  if (!isAuthorized(req)) return json({ ok: false, error: 'Unauthorized' }, 401);
  return handle();
}

export async function GET(req) {
  if (!isAuthorized(req)) return json({ ok: false, error: 'Unauthorized' }, 401);
  return handle();
}
