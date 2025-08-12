export async function fetchDemoJson(endpoint) {
  const res = await fetch(endpoint, { cache: 'no-store' });
  if (!res.ok) throw new Error(`demo-json fetch failed: ${res.status}`);
  
  const arr = await res.json();
  
  return (arr || [])
    .map(x => ({
      source: 'demo-json',
      title: String(x.title ?? '').slice(0, 200),
      url: String(x.url || ''),
      price: x.price != null ? Number(x.price) : null,
      currency: x.currency || 'EUR',
      created_at: x.created_at || new Date().toISOString(),
    }))
    .filter(x => x.title && x.url);
}
