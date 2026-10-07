import { useWord } from '../context/WordContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ExternalLink, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { TextGenerateEffect } from '../components/ui/text-generate-effect';
import { BackgroundRippleEffect } from '../components/ui/background-ripple-effect';

export default function WordOfTheDay() {
    const { getLatestWord, getPreviousWords } = useWord();
    const latestWord = getLatestWord();
    const previousWords = getPreviousWords();

    useEffect(() => { window.scrollTo(0, 0); }, []);

    // Responsive marquee speed
    const [marqueeDuration, setMarqueeDuration] = useState(18);
    useEffect(() => {
        const handleResize = () => setMarqueeDuration(window.innerWidth < 768 ? 2.5 : 18);
        handleResize(); // init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Track scroll to move title upward (simulating natural scroll)
    // NO opacity fade — title stays fully visible and goes behind the card
    const { scrollY } = useScroll();
    const titleY = useTransform(scrollY, [0, 800], [0, -400]);

    // --- Date Filter Logic ---
    const [selectedDate, setSelectedDate] = useState(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const filterRef = useRef(null);

    // Get unique dates from all words
    const allWords = latestWord ? [latestWord, ...previousWords] : previousWords;
    const availableDates = [...new Set(allWords.map(w => w.date))].sort((a, b) => b.localeCompare(a));

    const filteredWords = selectedDate
        ? previousWords.filter(w => w.date === selectedDate)
        : previousWords;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    // --- End Date Filter Logic ---

    if (!latestWord) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black mb-4 tracking-tighter ">WORD OF THE DAY</h1>
                <p className="text-neutral-500 mb-8">No words verified yet. Check back soon!</p>
                <Link to="/" className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-colors">
                    Back Home
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-black text-white relative">

            {/* Full-page interactive grid background */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <BackgroundRippleEffect rows={35} cols={45} />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full z-[60] p-6 mix-blend-difference">

            </nav>

            {/* ============================================ */}
            {/* TITLE: "WORD OF THE DAY"                     */}
            {/* Scrolls up via JS translateY (no fade).      */}
            {/* Lower z-index so it goes BEHIND the card.    */}
            {/* ============================================ */}
            <div className="relative h-[60vh] md:h-screen flex items-center justify-center pt-0 md:pt-0 pb-0 md:pb-0" style={{ zIndex: 1 }}>
                <motion.div
                    style={{ y: titleY }}
                    className="relative z-10 w-full flex flex-col items-center justify-center px-4"
                >
                    <span className="block text-[24vw] md:text-[16vw] font-black text-white leading-[0.85] tracking-[-0.04em] text-center" style={{ fontFamily: "var(--font-heading)" }}>WORD</span>
                    <span className="block text-[15vw] md:text-[10vw] font-black text-white leading-[0.85] tracking-[-0.04em] text-center" style={{ fontFamily: "var(--font-heading)" }}>OF THE</span>
                    <span className="block text-[24vw] md:text-[16vw] font-black text-white leading-[0.85] tracking-[-0.04em] text-center" style={{ fontFamily: "var(--font-heading)" }}>DAY</span>
                </motion.div>
            </div>

            {/* ============================================ */}
            {/* CONTENT CARD                                 */}
            {/* Higher z-index covers the title.             */}
            {/* Semi-transparent bg so title peeks through.  */}
            {/* ============================================ */}
            <div className="relative -mt-[23vh] md:-mt-[30vh]" style={{ zIndex: 10 }}>

                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.05 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="max-w-5xl mx-auto px-4 md:px-6"
                >
                    <div className="bg-black/85 backdrop-blur-lg border border-neutral-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_-20px_80px_rgba(0,0,0,0.7)]">

                        {/* Card Header */}
                        <div className="p-8 md:p-12 lg:p-16 border-b border-neutral-800 relative">

                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-white/10 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 text-white/80">
                                    {latestWord.date} &bull; {latestWord.category}
                                </span>
                                <h2
                                    className="text-[52px] leading-tight md:text-8xl font-black tracking-tighter text-white mb-6"
                                    style={{ fontFamily: "var(--font-heading)" }}
                                >
                                    {latestWord.title}
                                </h2>
                                <TextGenerateEffect
                                    words={latestWord.definition}
                                    className="text-center mx-auto text-xs md:text-2xl italic text-white max-w-3xl leading-relaxed"
                                    duration={2}
                                />
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="flex flex-col-reverse lg:flex-row lg:min-h-[400px]">
                            {/* Explanation */}
                            <div className="w-full lg:w-1/2 p-8 md:p-12 lg:border-r border-neutral-800 flex flex-col justify-start text-left items-start">
                                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-6">Deep Dive</h3>
                                <div className="text-[15px] text-neutral-400 leading-relaxed text-base">
                                    {latestWord.explanation.split('\n').map((para, i) => (
                                        <p key={i} className="mb-4">{para}</p>
                                    ))}
                                </div>
                                {latestWord.readMoreUrl && (
                                    <a
                                        href={latestWord.readMoreUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors self-start"
                                    >
                                        Read More <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>

                            {/* Single Image */}
                            {/* Right Column: Image + Example */}
                            <div className="w-full lg:w-1/2 flex flex-col bg-neutral-900 border-l border-neutral-800">
                                {/* Image Section (natural height) */}
                                <div className="relative overflow-hidden group">
                                    {latestWord.imageUrl ? (
                                        <>
                                            <img
                                                src={latestWord.imageUrl}
                                                alt={latestWord.title}
                                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                                        </>
                                    ) : (
                                        <div className="h-[250px] flex items-center justify-center bg-neutral-900">
                                            <p className="text-neutral-600">No image available</p>
                                        </div>
                                    )}
                                </div>

                                {/* Example Section (tight height on mobile, centered on desktop) */}
                                <div className="lg:flex-1 flex flex-col items-center justify-center p-6 md:p-8 border-t border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-3 text-center">
                                        Example
                                    </h3>
                                    <p className="text-neutral-400 text-sm leading-relaxed italic text-center">
                                        "{latestWord.example ? latestWord.example : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Archive Section */}
                <section className="pt-10 pb-24 bg-black border-t border-neutral-800/40 mt-16 relative z-20 overflow-hidden">

                    {/* ── Huge scrolling marquee title ── */}
                    <div className="relative overflow-hidden mb-10 md:mb-14">
                        <motion.div
                            className="flex whitespace-nowrap"
                            animate={{ x: ['0%', '-50%'] }}
                            transition={{
                                repeat: Infinity,
                                ease: 'linear',
                                duration: marqueeDuration
                            }}
                        >
                            {[...Array(4)].map((_, i) => (
                                <span
                                    key={i}
                                    className="text-[13vw] md:text-[11vw] font-black text-white tracking-tighter leading-none pr-[4vw] select-none"
                                    style={{ fontFamily: "var(--font-heading)" }}
                                >
                                    Featured Words@&nbsp;
                                </span>
                            ))}
                        </motion.div>
                    </div>

                    <div className="max-w-7xl mx-auto px-5 md:px-8">

                        {/* Filter row */}
                        <div className="flex justify-end mb-8" ref={filterRef}>
                            <div className="relative">

                                {/* Trigger button */}
                                <button
                                    onClick={() => setFilterOpen(o => !o)}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${selectedDate ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}
                                >
                                    {selectedDate ? selectedDate : 'Filter by date'}
                                    {selectedDate
                                        ? <X className="w-3 h-3" onClick={(e) => { e.stopPropagation(); setSelectedDate(null); setFilterOpen(false); }} />
                                        : <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                                    }
                                </button>

                                {/* Custom dropdown panel */}
                                {filterOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute right-0 top-full mt-2 w-52 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                                    >
                                        {/* Text input to type a date */}
                                        <div className="px-3 pt-3 pb-2">
                                            <input
                                                type="text"
                                                placeholder="YYYY-MM-DD"
                                                value={selectedDate || ''}
                                                onChange={(e) => setSelectedDate(e.target.value || null)}
                                                className="w-full bg-neutral-800 text-white text-xs px-3 py-2 rounded-lg outline-none border border-neutral-700 focus:border-white/40 placeholder-neutral-600 font-mono"
                                            />
                                        </div>
                                        <div className="h-px bg-neutral-800 mx-3" />
                                        {/* Available dates list */}
                                        <div className="max-h-44 overflow-y-auto py-1">
                                            <button
                                                onClick={() => { setSelectedDate(null); setFilterOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-xs transition-colors ${!selectedDate ? 'text-white font-semibold bg-white/5' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                                            >
                                                All dates
                                            </button>
                                            {availableDates.map(date => (
                                                <button
                                                    key={date}
                                                    onClick={() => { setSelectedDate(date); setFilterOpen(false); }}
                                                    className={`w-full text-left px-4 py-2 text-xs font-mono transition-colors ${selectedDate === date ? 'text-black font-bold bg-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    {date}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                            </div>
                        </div>

                        {/* Cards Grid */}
                        {filteredWords.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-6 sm:gap-10 md:gap-14">
                                {filteredWords.map((word) => (
                                    <WordCard key={word._id} word={word} />
                                ))}
                            </div>
                        ) : (
                            <div className="h-52 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-2xl text-neutral-600 gap-3">
                                <p className="text-sm">No words found for <span className="text-white font-bold">{selectedDate}</span></p>
                                <button onClick={() => setSelectedDate(null)} className="text-sm text-white underline underline-offset-4 transition-colors">
                                    View all words
                                </button>
                            </div>
                        )}
                    </div>
                </section>

            </div>{/* closes zIndex:10 wrapper */}

        </div>
    );
}

/* ── Word card — Roboto font, no blob ── */
function WordCard({ word }) {
    return (
        <Link
            to={`/word-of-the-day/${word._id}`}
            className="group block border-b border-neutral-800 pb-10 sm:border-0 sm:pb-0 last:border-0"
        >
            {/* Image */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                <img
                    src={word.imageUrl}
                    alt={word.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
            </div>

            {/* Title */}
            <h3
                style={{ fontFamily: "var(--font-heading)" }}
                className="text-left text-[22px] md:text-[25px] font-semibold text-white leading-[1.25] tracking-tight mb-2 group-hover:text-neutral-400 transition-colors duration-300"
            >
                {word.title}
            </h3>

            {/* Category */}
            <p
                style={{ fontFamily: "var(--font-heading)" }}
                className="text-left text-[14px] text-neutral-500 font-normal mb-3"
            >
                {word.category}
            </p>

            {/* Read more */}
            <span
                style={{ fontFamily: "var(--font-heading)" }}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/70 group-hover:text-white group-hover:gap-2.5 transition-all duration-300"
            >
                Read more <span className="text-base">→</span>
            </span>
        </Link>
    );
}
