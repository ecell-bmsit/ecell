import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import Footer from '../Footer/Footer';

/**
 * Shared event page layout: two-column (sidebar + hover-to-expand grid).
 * Props:
 *   title, titleLine2 - main heading (e.g. "CODERED", "25")
 *   eventSubtitle - e.g. "Feb 15, 2025 at 6 Hours"
 *   eventDetail - e.g. "Competitive programming • 247 participants"
 *   mainStatValue, mainStatLabel - e.g. "247", "Participants"
 *   statDetail - e.g. "Duration: 6 Hours | Winners: 3 Teams"
 *   highlights - [{ title, description, time }]
 *   galleryImages - [src, ...]
 */
const EventPageLayout = ({
  title,
  titleLine2 = '',
  eventSubtitle,
  eventDetail,
  mainStatValue,
  mainStatLabel,
  statDetail,
  highlights = [],
  galleryImages = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  const normalizedHighlights = highlights.map((h) =>
    typeof h === 'string'
      ? { title: h, description: h, time: 'Event highlight' }
      : h
  );
  const filteredHighlights = searchQuery
    ? normalizedHighlights.filter((h) =>
        h.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : normalizedHighlights;

  const tabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Highlights', label: 'Highlights' },
    { id: 'Gallery', label: 'Gallery' },
  ];

  const displayImages = galleryImages.length > 0 ? galleryImages : [];
  const getImage = (index) =>
    displayImages[index % displayImages.length] || null;

  return (
    <div
      className="min-h-screen bg-[#0d0d0d] text-white flex flex-col"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      <div className="flex flex-1 min-h-screen">
        <aside className="w-full lg:w-[34%] xl:w-[30%] flex-shrink-0 border-r border-white/10 flex flex-col p-6 lg:p-8 xl:p-10">
          <div className="mb-8">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold italic leading-tight text-white"
              style={{ fontFamily: 'var(--font-subheading)' }}
            >
              <span className="block">{title}</span>
              {titleLine2 && <span className="block">{titleLine2}</span>}
            </h1>
            <p className="mt-4 text-sm text-white/70">{eventSubtitle}</p>
            <p className="text-xs text-white/50 mt-0.5">Event Recap</p>
          </div>

          <div className="flex gap-2 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search highlights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20"
              />
            </div>
            <button
              type="button"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium text-white border border-white/10 transition-colors"
            >
              Search
            </button>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <div className="bg-white/[0.06] border border-white/10 rounded-xl p-5 lg:p-6 flex flex-col">
              <div className="flex items-baseline justify-between gap-2 mb-4">
                <h2 className="text-lg font-bold text-white">Event details</h2>
                <span className="text-xs text-white/50">Updated at event end</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
                <MapPin className="w-4 h-4 flex-shrink-0 text-white/50" />
                <span>{eventDetail}</span>
              </div>
              <div className="mb-4">
                <p className="text-4xl font-bold text-white">{mainStatValue}</p>
                <p className="text-sm text-white/60 mt-0.5">{mainStatLabel}</p>
                {statDetail && (
                  <p className="text-sm text-white/60 mt-2">{statDetail}</p>
                )}
              </div>
              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex gap-1 p-1 bg-black/30 rounded-lg">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white/15 text-white'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-auto p-6 lg:p-8 xl:p-10 flex items-start">
          <div className="max-w-6xl mx-auto w-full">
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 grid-auto-flow-dense [grid-auto-rows:minmax(220px,auto)] lg:[grid-auto-rows:minmax(240px,auto)]">
                {filteredHighlights.slice(0, 9).map((item, i) => (
                  <article
                    key={i}
                    className="group/card flex flex-col bg-[#0d0d0d] border border-white/10 rounded-lg overflow-hidden cursor-pointer transition-[grid-column,grid-row,border-color,box-shadow] duration-300 ease-out hover:z-10 lg:hover:col-span-2 lg:hover:row-span-2 hover:border-white/20 hover:shadow-xl hover:shadow-black/50"
                  >
                    {getImage(i) && (
                      <div className="flex-shrink-0 w-full h-32 sm:h-36 lg:group-hover/card:flex-1 lg:group-hover/card:min-h-[220px] overflow-hidden bg-white/5">
                        <img
                          src={getImage(i)}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-[1.02]"
                        />
                      </div>
                    )}
                    <div className="flex-shrink-0 flex flex-col p-3 sm:p-4">
                      <h3
                        className="text-sm sm:text-base font-bold italic text-white leading-tight line-clamp-2"
                        style={{ fontFamily: 'var(--font-subheading)' }}
                      >
                        {item.title}
                      </h3>
                      <div className="mt-1.5 overflow-hidden transition-[max-height] duration-300 max-h-24 lg:max-h-0 lg:group-hover/card:max-h-20">
                        <p className="text-xs text-white/75 leading-relaxed line-clamp-2 lg:group-hover/card:line-clamp-3">
                          {item.description}
                        </p>
                        <p className="mt-1 text-xs text-white/50">{item.time}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {activeTab === 'Highlights' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredHighlights.map((item, i) => (
                  <article
                    key={i}
                    className="flex gap-4 items-start p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                  >
                    {getImage(i) && (
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                        <img
                          src={getImage(i)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-white/90 leading-snug">
                        {item.title}
                      </p>
                      <p className="text-xs text-white/50 mt-1">{item.time}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {activeTab === 'Gallery' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {displayImages.map((src, i) => (
                  <article key={i} className="flex gap-4 items-start group">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                      <img
                        src={src}
                        alt={`Moment ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-base text-white/90 leading-snug pt-2">
                      Captured moment {i + 1}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EventPageLayout;
