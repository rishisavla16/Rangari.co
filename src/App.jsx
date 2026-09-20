import { useEffect, useState } from 'react';
import { Header, Footer, PageLoader } from './components/Layout.jsx';
import { loadPublicContent } from './lib/api.js';
import { Admin } from './pages/Admin.jsx';
import { About, Contact, Gallery, Home } from './pages/PublicPages.jsx';

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { if (path !== '/admin') loadPublicContent().then(setContent).catch(() => setError('The site content could not be loaded.')); }, [path]);
  if (path === '/admin') return <Admin />;
  if (error) return <main className="error-page"><h1>Content unavailable</h1><p>{error}</p></main>;
  if (!content) return <PageLoader />;
  const Page = path === '/about' ? About : path === '/gallery' ? Gallery : path === '/contact' ? Contact : Home;
  return <><a className="skip-link" href="#main-content">Skip to content</a><div className="site-shell"><Header path={path} /><div id="main-content"><Page content={content} /></div><Footer content={content.footer} /></div></>;
}
