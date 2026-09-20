import { useEffect, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { api, normalizeContent } from '../lib/api.js';

const emptyCard = (order = 0) => ({ title: '', description: '', primaryImage: '', images: [], sortOrder: order });

function Login({ onLogin }) {
  const [error, setError] = useState('');
  const submit = async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); setError(''); try { await onLogin(form.get('email'), form.get('password')); } catch (err) { setError(err.message); } };
  return <main className="admin-page"><form className="admin-card login" onSubmit={submit}><img src="/assets/logo-yellow.png" alt="Rangari" /><h1>Administrator sign in</h1><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{error && <p className="error" role="alert">{error}</p>}<button className="button">Sign in</button></form></main>;
}

function ContentEditor({ label, value, onSave }) {
  const [draft, setDraft] = useState(JSON.stringify(value, null, 2));
  const [message, setMessage] = useState('');
  useEffect(() => setDraft(JSON.stringify(value, null, 2)), [value]);
  const save = async () => { try { const parsed = JSON.parse(draft); await onSave(parsed); setMessage('Saved.'); } catch (error) { setMessage(error instanceof SyntaxError ? 'Please enter valid JSON.' : error.message); } };
  return <section className="admin-panel"><h2>{label}</h2><p>Use the existing content structure. Image URLs may be local `/assets/...` paths or Vercel Blob URLs.</p><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows="16" aria-label={`${label} JSON`} /><button className="button" type="button" onClick={save}>Save {label}</button><span className="form-message" aria-live="polite">{message}</span></section>;
}

function ImageUpload({ onUploaded }) {
  const [message, setMessage] = useState('');
  const uploadImage = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    setMessage(`Uploading ${file.name}…`);
    try { const blob = await upload(`rangari/${Date.now()}-${file.name}`, file, { access: 'public', handleUploadUrl: '/api/admin/upload' }); onUploaded(blob.url); setMessage('Uploaded.'); } catch (error) { setMessage(error.message || 'Upload failed.'); }
  };
  return <label className="upload-control">Upload image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} /><span aria-live="polite">{message}</span></label>;
}

function CardEditor({ card, onSave, onDelete, onCancel }) {
  const [draft, setDraft] = useState(card);
  const [message, setMessage] = useState('');
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const addImage = (url) => setDraft((current) => ({ ...current, primaryImage: current.primaryImage || url, images: [...current.images, url] }));
  const removeImage = async (url) => {
    if (!window.confirm('Remove this image from the project?')) return;
    try {
      if (/\.public\.blob\.vercel-storage\.com\//.test(url) && window.confirm('Also permanently delete this uploaded file from Vercel Blob?')) await api.deleteBlob(url);
      setDraft((current) => ({ ...current, primaryImage: current.primaryImage === url ? (current.images.find((image) => image !== url) || '') : current.primaryImage, images: current.images.filter((image) => image !== url) }));
      setMessage('Image removed. Save the card to update the project.');
    } catch (error) { setMessage(error.message); }
  };
  return <section className="admin-panel card-editor"><h2>{card.id ? `Edit: ${card.title}` : 'New gallery card'}</h2><label>Title<input value={draft.title} onChange={(event) => update('title', event.target.value)} required /></label><label>Description<textarea value={draft.description} rows="3" onChange={(event) => update('description', event.target.value)} /></label><label>Primary image URL<input value={draft.primaryImage} onChange={(event) => update('primaryImage', event.target.value)} required /></label><label>Image URLs, one per line<textarea value={draft.images.join('\n')} rows="7" onChange={(event) => update('images', event.target.value.split('\n').map((image) => image.trim()).filter(Boolean))} /></label><div className="image-manager">{draft.images.map((url) => <div key={url}><img src={url} alt="" /><button type="button" className="danger" onClick={() => removeImage(url)}>Remove image</button></div>)}</div><ImageUpload onUploaded={addImage} /><p className="form-message" aria-live="polite">{message}</p><div className="admin-actions"><button className="button" type="button" onClick={() => onSave(draft)}>Save card</button><button className="button secondary" type="button" onClick={onCancel}>Cancel</button>{card.id && <button className="danger" type="button" onClick={() => onDelete(card.id)}>Delete card</button>}</div></section>;
}

export function Admin() {
  const [user, setUser] = useState(undefined); const [content, setContent] = useState(null); const [editing, setEditing] = useState(null); const [error, setError] = useState('');
  const load = async () => { const data = normalizeContent(await api.adminContent()); setContent(data); };
  useEffect(() => { api.me().then(({ user: current }) => { setUser(current); return load(); }).catch(() => setUser(null)); }, []);
  const login = async (email, password) => { const result = await api.login(email, password); setUser(result.user); await load(); };
  const saveContent = async (key, value) => { await api.saveContent(key, value); setContent((current) => ({ ...current, [key]: value })); };
  const saveCard = async (card) => { try { const saved = await api.saveCard(card); setContent((current) => ({ ...current, gallery: card.id ? current.gallery.map((item) => item.id === saved.id ? { ...saved, primaryImage: saved.primary_image || saved.primaryImage } : item) : [...current.gallery, { ...saved, primaryImage: saved.primary_image || saved.primaryImage }] })); setEditing(null); } catch (err) { setError(err.message); } };
  const deleteCard = async (id) => { if (!window.confirm('Delete this gallery card? This does not delete Blob images.')) return; try { await api.deleteCard(id); setContent((current) => ({ ...current, gallery: current.gallery.filter((item) => item.id !== id) })); setEditing(null); } catch (err) { setError(err.message); } };
  const logout = async () => { await api.logout(); setUser(null); setContent(null); };
  if (user === undefined) return <main className="admin-page"><p className="status">Checking session…</p></main>;
  if (!user) return <Login onLogin={login} />;
  if (!content) return <main className="admin-page"><p className="status">Loading dashboard…</p></main>;
  return <main className="admin-page"><header className="admin-header"><div><p className="eyebrow">Rangari CMS</p><h1>Dashboard</h1><p>Signed in as {user.email}</p></div><button className="button secondary" onClick={logout}>Sign out</button></header>{error && <p className="error" role="alert">{error}</p>}<div className="admin-grid"><ContentEditor label="Home content" value={content.home} onSave={(value) => saveContent('home', value)} /><ContentEditor label="About content" value={content.about} onSave={(value) => saveContent('about', value)} /><ContentEditor label="Footer content" value={content.footer} onSave={(value) => saveContent('footer', value)} /></div><section className="admin-panel"><div className="panel-heading"><div><h2>Gallery cards</h2><p>{content.gallery.length} projects</p></div><button className="button" onClick={() => setEditing(emptyCard(content.gallery.length))}>Add project</button></div><div className="admin-gallery-list">{content.gallery.map((card) => <button type="button" key={card.id} className="admin-gallery-card" onClick={() => setEditing(card)}><img src={card.primaryImage} alt="" /><span>{card.title}</span></button>)}</div></section>{editing && <CardEditor card={editing} onSave={saveCard} onDelete={deleteCard} onCancel={() => setEditing(null)} />}</main>;
}
