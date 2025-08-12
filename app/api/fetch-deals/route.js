export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_SECRET = process.env.CRON_SECRET;

async function insertDemoRowsIfSupabase() {
  const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!hasSupabase) return { mode: "fallback", inserted: 0 };

  const { supabaseAdmin } = await import("../_lib/supabaseAdmin.js");
  const client = supabaseAdmin();

  const rows = [
    { source: "demo", title: "Test Deal 1", url: "https://example.com/a", price: 9.99, currency: "EUR", hash: "demo:https://example.com/a" },
    { source: "demo", title: "Test Deal 2", url: "https://example.com/b", price: 19.99, currency: "EUR", hash: "demo:https://example.com/b" }
  ];

  const { data, error } = await client.from("deals").upsert(rows, { onConflict: "hash" }).select();
  if (error) throw error;
  return { mode: "supabase", inserted: data?.length ?? 0 };
}

export async function GET(req) {
  try {
    const isVercelCron = req.headers.get("x-vercel-cron") === "1";
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    // Secret nur bei manuellen Aufrufen verlangen
    if (!isVercelCron) {
      if (!VALID_SECRET) return Response.json({ ok: false, error: "CRON_SECRET not set" }, { status: 500 });
      if (secret !== VALID_SECRET) return Response.json({ ok: false, error: "Invalid secret" }, { status: 401 });
    }

    const { mode, inserted } = await insertDemoRowsIfSupabase();

    return Response.json({
      ok: true,
      source: isVercelCron ? "vercel-cron" : "manual",
      mode,
      inserted,
      time: new Date().toISOString()
    });
  } catch (e) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
