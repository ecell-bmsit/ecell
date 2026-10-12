import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Footer from '../components/Footer/Footer';
import Preloader from '../components/Preloader/Preloader';

const ALL_IMAGES = [
  ...Array.from({ length: 35 }, (_, index) => index + 1),
  ...Array.from({ length: 7 }, (_, index) => index + 37),
].map((number) => `/gallery/image${number}.webp`);

const PRIORITY_COUNT = 4;

const Gallery = () => {
  const [imagesReady, setImagesReady] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const shuffledImages = useMemo(() => {
    const galleryData = ALL_IMAGES.map((src, index) => ({
      id: index + 1,
      src,
      alt: `E-Cell Gallery Image ${index + 1}`,
      title: 'E-Cell Moment',
    }));

    for (let i = galleryData.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [galleryData[i], galleryData[j]] = [galleryData[j], galleryData[i]];
    }

    return galleryData;
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all(shuffledImages.map(({ src }) => new Promise((resolve) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = src;
    }))).then(() => {
      if (active) setImagesReady(true);
    });

    return () => { active = false; };
  }, [shuffledImages]);

  return (
    <>
      {showPreloader && createPortal(
        <Preloader ready={imagesReady} onComplete={() => setShowPreloader(false)} />,
        document.body
      )}
      <style>
        {`
          
          .font-georgia {
            font-family: var(--font-subheading);
          }
          
          .font-sora {
            font-family: var(--font-heading);
          }
          
          .masonry-grid {
            column-count: 1;
            column-gap: 1.5rem;
          }
          
          @media (min-width: 640px) {
            .masonry-grid {
              column-count: 2;
            }
          }
          
          @media (min-width: 1024px) {
            .masonry-grid {
              column-count: 3;
            }
          }
          
          @media (min-width: 1280px) {
            .masonry-grid {
              column-count: 4;
            }
          }
          
          .masonry-item {
            break-inside: avoid;
            margin-bottom: 1.5rem;
            display: inline-block;
            width: 100%;
            content-visibility: auto;
            contain-intrinsic-size: 320px 240px;
          }
        `}
      </style>

      <div className="min-h-screen bg-black pt-22 pb-16 md:pt-23 px-4">
        {/* Navbar removed as it is global */}
        <div className="max-w-7xl mx-auto pt-4 md:pt-16">
          {/* Header Section */}
          <div className="text-center mb-16 md:mb-24">
            <h1 className="text-[5.5rem] sm:text-8xl md:text-[16vw] text-white tracking-[0.05em] uppercase leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
              Gallery
            </h1>
          </div>

          {/* Masonry Gallery Grid */}
          <div className="masonry-grid">
            {shuffledImages.map((image, index) => {
              const isPriority = index < PRIORITY_COUNT;
              return (
                <div
                  key={image.id}
                  className="masonry-item group relative overflow-hidden rounded-2xl bg-gray-100 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20"
                >
                  <div className="relative w-full">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" // h-auto preserves aspect ratio
                      loading={isPriority ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={isPriority ? 'high' : 'low'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>


      </div>
      <Footer />
    </>
  );
};

export default Gallery;
