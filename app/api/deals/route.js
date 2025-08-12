export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);
    const since = url.searchParams.get("since"); // ISO optional
    const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{ persistSession:false } });

    let query = supa.from("deals")
      .select("id,source,title,url,price,currency,created_at", { count:"exact" })
      .order("created_at", { ascending:false })
      .limit(limit);

    if (since) query = query.gte("created_at", since);

    const { data, error, count } = await query;
    if (error) throw error;

    return Response.json({ ok:true, count, items:data });
  } catch (e) {
    return Response.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}
