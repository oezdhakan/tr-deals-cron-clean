export async function fetchDummyJsonProducts(endpoint) {
  // Beispiel-Endpoint: https://dummyjson.com/products?limit=10
  const res = await fetch(endpoint, { cache: 'no-store' });
  if (!res.ok) throw new Error(`dummyjson fetch failed: ${res.status}`);

  const data = await res.json();
  const arr = Array.isArray(data?.products) ? data.products : [];

  return arr
    .map(p => ({
      source: 'dummyjson-products',
      title: String(p.title ?? '').slice(0, 200),
      url: `https://dummyjson.com/products/${p.id}`,      // einfache Detail-URL
      price: p.price != null ? Number(p.price) : null,    // USD auf DummyJSON
      currency: 'USD',
      created_at: new Date().toISOString(),
    }))
    .filter(x => x.title && x.url);
}
