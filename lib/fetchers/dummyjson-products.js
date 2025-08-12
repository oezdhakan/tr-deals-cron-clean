// Holt Produkte von https://dummyjson.com/products?limit=10
export async function fetchDummyJsonProducts(endpoint) {
  const res = await fetch(endpoint, { cache: 'no-store' });
  if (!res.ok) throw new Error(`dummyjson fetch failed: ${res.status}`);

  const data = await res.json();
  const products = Array.isArray(data?.products) ? data.products : [];

  return products
    .map(p => ({
      source: 'dummyjson-products',
      title: String(p.title ?? '').slice(0, 200),
      url: `https://dummyjson.com/products/${p.id}`,
      price: p.price != null ? Number(p.price) : null,
      currency: 'USD',
      created_at: new Date().toISOString(),
    }))
    .filter(x => x.title && x.url);
}
