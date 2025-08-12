export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  let count = null, error = null, urlHint = null;
  try {
    if (hasUrl && hasKey) {
      const c = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false} });
      urlHint = process.env.SUPABASE_URL.replace(/^https?:\/\//,'').slice(0,30);
      const { count: cnt, error: e } = await c.from("deals").select("id", { count: "exact", head: true });
      if (e) throw e;
      count = cnt ?? 0;
    }
  } catch (e) { error = e?.message || String(e); }
  return Response.json({ ok:true, hasUrl, hasKey, urlHint, count, error });
}
