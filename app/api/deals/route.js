export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const url = new URL(req.url);

    // limit: default 50, max 100
    const limitParam = url.searchParams.get("limit");
    const parsed = Number(limitParam);
    const limit = Math.min(Number.isFinite(parsed) ? parsed : 50, 100);

    // optional: since=ISO-String
    const since = url.searchParams.get("since");

    const supa = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    let q = supa
      .from("deals")
      .select("id,source,title,url,price,currency,created_at", { count: "exact" }) // KEIN head:true
      .order("created_at", { ascending: false })
      .limit(limit);

    if (since) q = q.gte("created_at", since);

    const { data, error, count } = await q;
    if (error) throw error;

    return Response.json({ ok: true, count: count ?? (data?.length ?? 0), items: data ?? [] });
  } catch (e) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
