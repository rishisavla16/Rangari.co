import { useEffect, useState } from 'react';

export function Carousel({ items, label, autoPlay = true }) {
  const [current, setCurrent] = useState(0);
  const [startX, setStartX] = useState(null);
  const length = items?.length || 0;
  useEffect(() => {
    if (!autoPlay || length < 2) return undefined;
    const id = window.setInterval(() => setCurrent((value) => (value + 1) % length), 5000);
    return () => window.clearInterval(id);
  }, [autoPlay, length]);
  if (!length) return <p className="status">No images are available.</p>;
  const select = (index) => setCurrent((index + length) % length);
  const keyDown = (event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); select(current - 1); } if (event.key === 'ArrowRight') { event.preventDefault(); select(current + 1); } };
  return <section className="carousel" aria-label={label} tabIndex="0" onKeyDown={keyDown} onTouchStart={(event) => setStartX(event.changedTouches[0].screenX)} onTouchEnd={(event) => { const distance = event.changedTouches[0].screenX - startX; if (Math.abs(distance) > 40) select(current + (distance < 0 ? 1 : -1)); setStartX(null); }}>
    <div className="carousel-viewport">{items.map((item, index) => <div className={`carousel-slide ${index === current ? 'active' : ''}`} key={item.image || item}><img src={item.image || item} alt={item.alt || `${label} image ${index + 1}`} /></div>)}</div>
    {length > 1 && <><button className="carousel-control previous" type="button" onClick={() => select(current - 1)} aria-label="Previous image">‹</button><button className="carousel-control next" type="button" onClick={() => select(current + 1)} aria-label="Next image">›</button><div className="carousel-dots">{items.map((_, index) => <button key={index} type="button" className={index === current ? 'active' : ''} aria-label={`Show image ${index + 1}`} aria-current={index === current || undefined} onClick={() => select(index)} />)}</div></>}
  </section>;
}
