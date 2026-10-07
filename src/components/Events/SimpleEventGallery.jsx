import React, { useEffect } from 'react';

const SimpleEventGallery = ({ title, titleLine2, images = [] }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col pt-24 pb-20">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 mt-12">
        <div className="mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold italic text-white tracking-tight" style={{ fontFamily: 'var(--font-subheading)' }}>
            {title} {titleLine2}
          </h1>
          {images.length === 0 && (
             <p className="mt-12 text-white/40 text-xl font-light tracking-tight">Images coming soon...</p>
          )}
        </div>
        
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {images.map((img, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                <img 
                  src={img} 
                  alt={`${title} ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleEventGallery;
