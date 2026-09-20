import { useEffect } from 'react';
import { Carousel } from './Carousel.jsx';

export function GalleryModal({ card, onClose }) {
  useEffect(() => { const close = (event) => event.key === 'Escape' && onClose(); document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close); }, [onClose]);
  if (!card) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={onClose} aria-label="Close gallery">×</button><h2 id="modal-title">{card.title}</h2><p>{card.description}</p><Carousel label={`${card.title} images`} items={card.images} autoPlay={false} /></section></div>;
}
