import { useEffect, useRef, useState, useCallback } from 'react';

const NUM_COLS = 5;
const GAP = 60;

const COL_WIDTH = 260;         // fixed column width — portrait: tall, landscape: short
const MODULE_WIDTH = NUM_COLS * COL_WIDTH + (NUM_COLS - 1) * GAP;
const DRAG_SPEED = 0.5;
const INERTIA = 0.86;

/**
 * Fixed-column masonry layout.
 *  - All columns have the same width.
 *  - Portrait images are tall, landscape images are short (natural aspect ratio).
 *  - Columns are filled to the same height (padding with cycled images)
 *    so the infinite tile wraps seamlessly with no empty strips.
 */
function buildLayout(images) {
  if (!images.length) return { items: [], moduleW: MODULE_WIDTH, moduleH: 0 };

  // Pre-compute each image's column-width display dimensions
  const sized = images.map((img) => {
    const h = Math.round((img.naturalHeight / img.naturalWidth) * COL_WIDTH);
    return { src: img.src, w: COL_WIDTH, h };
  });

  // Distribute images across columns round-robin
  const cols = Array.from({ length: NUM_COLS }, () => []);
  sized.forEach((item, i) => cols[i % NUM_COLS].push({ ...item }));

  // Compute raw column heights
  const colH = (col) => col.reduce((s, it) => s + it.h + GAP, 0) - GAP;

  // We need to loop images in columns until they are roughly the same height,
  // but to make them tile perfectly without uneven gaps, every column must be EXACTLY the same height.
  // First, pad shorter columns roughly up to maxH.
  let maxH = Math.max(...cols.map(colH));

  cols.forEach((col) => {
    let idx = 0;
    // pad until the column is close to maxH
    while (colH(col) < maxH - (COL_WIDTH / 2)) {
      const it = sized[idx % sized.length];
      col.push({ ...it });
      idx++;
    }
  });

  // Now maxH might have increased if a pushed image was very tall
  maxH = Math.max(...cols.map(colH));

  // Exactly stretch images in each column so every column precisely equals maxH
  cols.forEach((col) => {
    const currentH = col.reduce((sum, item) => sum + item.h, 0);
    const targetH = maxH - (col.length - 1) * GAP;

    // Distribute ratio to match exact height
    const ratio = targetH / currentH;
    col.forEach((item) => {
      item.h = Math.round(item.h * ratio);
    });

    // Fix rounding errors in exact pixel counts by giving remainder to the last item
    const newTotalH = col.reduce((sum, item) => sum + item.h, 0);
    if (newTotalH !== targetH) {
      col[col.length - 1].h += targetH - newTotalH;
    }
  });

  const moduleH = maxH + GAP;


  // Assign absolute x / y positions
  const items = [];
  cols.forEach((col, ci) => {
    const x = ci * (COL_WIDTH + GAP);
    let y = 0;
    col.forEach((item) => {
      items.push({ ...item, x, y });
      y += item.h + GAP;
    });
  });

  return { items, moduleW: MODULE_WIDTH, moduleH };
}

export default function InfiniteMasonryGallery({ images }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  // Refs for drag & animation (no re-renders)
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const lastRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const layoutRef = useRef(null);
  const rafRef = useRef(null);

  // Keep layoutRef in sync
  useEffect(() => { layoutRef.current = layout; }, [layout]);

  // Preload images
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      images.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => { img.naturalWidth = 400; img.naturalHeight = 300; img.src = src; resolve(img); };
            img.src = src;
          })
      )
    ).then((loaded) => {
      if (!cancelled) {
        setLayout(buildLayout(loaded));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [images]);

  // RAF animation loop — runs once, reads refs
  useEffect(() => {
    const animate = () => {
      if (!draggingRef.current) {
        velRef.current.x *= INERTIA;
        velRef.current.y *= INERTIA;
        posRef.current.x += velRef.current.x;
        posRef.current.y += velRef.current.y;
      }

      const ly = layoutRef.current;
      if (ly) {
        const mw = ly.moduleW + GAP;
        const mh = ly.moduleH + GAP;
        posRef.current.x = ((posRef.current.x % mw) + mw) % mw;
        posRef.current.y = ((posRef.current.y % mh) + mh) % mh;
      }

      if (canvasRef.current) {
        canvasRef.current.style.transform =
          `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // empty deps — only runs once


  useEffect(() => {
    const handleMove = (e) => {
      if (!draggingRef.current) return;
      const pt = e.touches ? e.touches[0] : e;
      const dx = pt.clientX - lastRef.current.x;
      const dy = pt.clientY - lastRef.current.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) movedRef.current = true;
      posRef.current.x += dx * DRAG_SPEED;
      posRef.current.y += dy * DRAG_SPEED;
      velRef.current = { x: dx * DRAG_SPEED, y: dy * DRAG_SPEED };
      lastRef.current = { x: pt.clientX, y: pt.clientY };
      if (e.cancelable) e.preventDefault();
    };

    const handleUp = () => {
      draggingRef.current = false;
      if (rootRef.current) rootRef.current.style.cursor = 'grab';
    };

    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  const handleRootDown = useCallback((e) => {
    draggingRef.current = true;
    movedRef.current = false;
    velRef.current = { x: 0, y: 0 };
    const pt = e.touches ? e.touches[0] : e;
    lastRef.current = { x: pt.clientX, y: pt.clientY };
    if (rootRef.current) rootRef.current.style.cursor = 'grabbing';
  }, []);

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1rem',
        letterSpacing: '0.12em', background: 'transparent',
      }}>
        Loading Gallery...
      </div>
    );
  }

  if (!layout) return null;

  const { items, moduleW, moduleH } = layout;
  const repsX = Math.ceil(window.innerWidth / moduleW) + 2;
  const repsY = Math.ceil(window.innerHeight / moduleH) + 2;

  const tiles = [];
  for (let ty = -1; ty < repsY; ty++) {
    for (let tx = -1; tx < repsX; tx++) {
      items.forEach((item, i) => {
        tiles.push({
          key: `${tx}-${ty}-${i}`,
          src: item.src,
          x: item.x + tx * (moduleW + GAP),
          y: item.y + ty * (moduleH + GAP),
          w: item.w,
          h: item.h,
        });
      });
    }
  }

  return (
    <>
      <style>{`
        .img-gallery-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
          z-index: 1;
        }
        .img-gallery-canvas {
          position: absolute;
          top: 0;
          left: 0;
          will-change: transform;
        }
        .img-gallery-item {
          position: absolute;
          border-radius: 6px;
          overflow: hidden;
          transition: transform 0.2s ease;
          will-change: transform;
          transform: translateZ(0); 
          backface-visibility: hidden;
        }
        .img-gallery-item:hover {
          z-index: 10;
        }
        .img-gallery-item img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }
        .ig-lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.92);
          z-index: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
          cursor: pointer;
        }
        .ig-lightbox img {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          pointer-events: none;
        }
        .ig-lightbox-close {
          position: absolute;
          top: 24px; right: 28px;
          color: rgba(255,255,255,0.8);
          font-size: 2rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .ig-lightbox-close:hover { color: white; }
      `}</style>

      <div
        ref={rootRef}
        className="img-gallery-root"
        onMouseDown={handleRootDown}
        onTouchStart={handleRootDown}
      >
        <div ref={canvasRef} className="img-gallery-canvas">
          {tiles.map((tile) => (
            <div
              key={tile.key}
              className="img-gallery-item"
              style={{ left: tile.x, top: tile.y, width: tile.w, height: tile.h }}
              onClick={() => { if (!movedRef.current) setLightbox(tile.src); }}
            >
              <img src={tile.src} alt="E-Cell Gallery" draggable="false" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="ig-lightbox" onClick={() => setLightbox(null)}>
          <span className="ig-lightbox-close">✕</span>
          <img src={lightbox} alt="Expanded view" />
        </div>
      )}
    </>
  );
}
