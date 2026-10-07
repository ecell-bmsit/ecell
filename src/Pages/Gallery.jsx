import React, { useMemo, useState } from 'react';
import Footer from '../components/Footer/Footer';

// Image Imports
import img1 from '../assets/image1.webp';
import img2 from '../assets/image2.webp';
import img3 from '../assets/image3.webp';
import img4 from '../assets/image4.webp';
import img5 from '../assets/image5.webp';
import img6 from '../assets/image6.webp';
import img7 from '../assets/image7.webp';
import img8 from '../assets/image8.webp';
import img9 from '../assets/image9.webp';
import img10 from '../assets/image10.webp';
import img11 from '../assets/image11.webp';
import img12 from '../assets/image12.webp';
import img13 from '../assets/image13.webp';
import img14 from '../assets/image14.webp';
import img15 from '../assets/image15.webp';
import img16 from '../assets/image16.webp';
import img17 from '../assets/image17.webp';
import img18 from '../assets/image18.webp';
import img19 from '../assets/image19.webp';
import img20 from '../assets/image20.webp';
import img21 from '../assets/image21.webp';
import img22 from '../assets/image22.webp';
import img23 from '../assets/image23.jpg';
import img24 from '../assets/image24.webp';
import img25 from '../assets/image25.webp';
import img26 from '../assets/image26.webp';
import img27 from '../assets/image27.webp';
import img28 from '../assets/image28.webp';
import img29 from '../assets/image29.webp';
import img30 from '../assets/image30.webp';
import img31 from '../assets/image31.webp';
import img32 from '../assets/image32.webp';
import img33 from '../assets/image33.webp';
import img34 from '../assets/image34.webp';
import img35 from '../assets/image35.webp';
import img37 from '../assets/image37.webp';
import img38 from '../assets/image38.webp';
import img39 from '../assets/image39.webp';
import img40 from '../assets/image40.webp';
import img41 from '../assets/image41.webp';
import img42 from '../assets/image42.webp';
import img43 from '../assets/image43.webp';

const ALL_IMAGES = [
  img1, img2, img3, img4, img5, img6, img7, img8, img9, img10,
  img11, img12, img13, img14, img15, img16, img17, img18, img19, img20,
  img21, img22, img23, img24, img25, img26, img27, img28, img29, img30,
  img31, img32, img33, img34, img35, img37, img38, img39, img40,
  img41, img42, img43,
];

const PRIORITY_COUNT = 4;

const Gallery = () => {
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

  const [visibleCount] = useState(shuffledImages.length);

  const visibleImages = useMemo(
    () => shuffledImages.slice(0, visibleCount),
    [shuffledImages, visibleCount]
  );


  return (
    <>
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

      <div className="min-h-screen bg-white pt-22 pb-16 md:pt-23 px-4">
        {/* Navbar removed as it is global */}
        <div className="max-w-7xl mx-auto pt-4 md:pt-16">
          {/* Header Section */}
          <div className="text-center mb-16 md:mb-24">
            <h1 className="text-[5.5rem] sm:text-8xl md:text-[16vw] text-black tracking-[0.05em] uppercase leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
              Gallery
            </h1>
          </div>

          {/* Masonry Gallery Grid */}
          <div className="masonry-grid">
            {visibleImages.map((image, index) => {
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