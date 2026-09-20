async function request(path, options = {}) {
  const response = await fetch(path, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Request failed.');
  return body;
}

export const api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  adminContent: () => request('/api/admin/content'),
  saveContent: (key, value) => request('/api/admin/content', { method: 'PUT', body: JSON.stringify({ key, value }) }),
  saveCard: (card) => request('/api/admin/gallery', { method: card.id ? 'PUT' : 'POST', body: JSON.stringify(card) }),
  deleteCard: (id) => request(`/api/admin/gallery?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
  deleteBlob: (url) => request('/api/admin/blob', { method: 'DELETE', body: JSON.stringify({ url }) })
};

export function normalizeContent(data) {
  const path = (image) => image?.startsWith('/') || /^https?:/.test(image || '') ? image : `/${image || ''}`;
  return {
    home: data.home ? { ...data.home, carousel: (data.home.carousel || []).map((item) => ({ ...item, image: path(item.image) })) } : null,
    about: data.about ? { ...data.about, carousel: (data.about.carousel || []).map((item) => ({ ...item, image: path(item.image) })) } : null,
    footer: data.footer || null,
    gallery: (data.gallery || data.cards || []).map((card) => ({
      ...card,
      primaryImage: path(card.primaryImage || card.primary_image || `assets/images/${card.primary}`),
      images: (card.images || []).map((image) => image.startsWith('/') || /^https?:/.test(image) ? image : `/assets/images/${image}`)
    }))
  };
}

export async function loadPublicContent() {
  try {
    const response = await fetch('/api/public/content');
    if (response.ok) {
      const content = normalizeContent(await response.json());
      if (content.home && content.about && content.footer) return content;
    }
  } catch { /* static content is the resilient fallback before a database is provisioned */ }
  const [home, about, footer, gallery] = await Promise.all(['home', 'about', 'footer', 'gallery'].map(async (name) => (await fetch(`/data/${name}.json`)).json()));
  return normalizeContent({ home, about, footer, gallery: gallery.cards });
}
