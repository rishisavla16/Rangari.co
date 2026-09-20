import { useState } from 'react';

const links = [['/', 'Home'], ['/about', 'About'], ['/gallery', 'Gallery'], ['/contact', 'Contact']];

export function Header({ path }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <a className="brand" href="/" aria-label="Rangari home"><img src="/assets/logo-yellow.png" alt="Rangari" /></a>
    <button className="nav-toggle" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="primary-navigation"><span /><span /><span /><span className="sr-only">Menu</span></button>
    <nav id="primary-navigation" className={`site-nav ${open ? 'is-open' : ''}`} aria-label="Primary navigation">
      {links.map(([href, label]) => <a key={href} href={href} aria-current={path === href ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</a>)}
      <a href="/admin" aria-current={path === '/admin' ? 'page' : undefined}>Admin</a>
    </nav>
  </header>;
}

export function Footer({ content }) {
  if (!content) return <footer className="site-footer"><p>Loading contact details…</p></footer>;
  const items = [
    ['mail.png', content.email, `mailto:${content.email}`],
    ['no.png', content.phone, `tel:${content.phone}`],
    ['insta.png', content.instagram_handle, content.instagram_url],
    ['fb.png', content.facebook_handle, content.facebook_url]
  ];
  return <footer className="site-footer"><div className="footer-content"><div className="footer-links">
    {items.filter(([, label, href]) => label && href).map(([icon, label, href]) => <a className="footer-link" key={icon} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}><img src={`/assets/icons/${icon}`} alt="" />{label}</a>)}
  </div><p className="footer-address">{content.address}</p></div><p className="copyright">{String(content.copyright || '').replace('&copy;', '©')}</p></footer>;
}

export function PageLoader() { return <div className="page-loader" role="status" aria-label="Loading Rangari"><img src="/assets/rangari.jpg" alt="" /></div>; }
