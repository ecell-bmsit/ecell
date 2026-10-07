import { useParams, Link } from 'react-router-dom';
import { useWord } from '../context/WordContext';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TextGenerateEffect } from '../components/ui/text-generate-effect';
import { BackgroundRippleEffect } from '../components/ui/background-ripple-effect';

const API_URL = '';

export default function WordDetailPage() {
    const { id } = useParams();
    const { getWordById, loading } = useWord();
    const [word, setWord] = useState(null);
    const [fetchingWord, setFetchingWord] = useState(true);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    useEffect(() => {
        // First try from context
        const contextWord = getWordById(id);
        if (contextWord) {
            setWord(contextWord);
            setFetchingWord(false);
            return;
        }

        // If context is still loading, wait
        if (loading) return;

        // If not in context, fetch directly from API
        const fetchWord = async () => {
            try {
                const res = await fetch(`${API_URL}/api/words/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setWord(data);
                }
            } catch (err) {
                console.error('Failed to fetch word:', err);
            } finally {
                setFetchingWord(false);
            }
        };
        fetchWord();
    }, [id, loading, getWordById]);

    if (loading || fetchingWord) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-neutral-500 text-lg">Loading...</div>
            </div>
        );
    }

    if (!word) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black mb-4 tracking-tighter">Word Not Found</h1>
                <p className="text-neutral-500 mb-8">This word doesn't exist or may have been removed.</p>
                <Link to="/word-of-the-day" className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-colors">
                    Back to Archive
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-black text-white relative min-h-screen">

            {/* Full-page interactive grid background */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <BackgroundRippleEffect rows={35} cols={45} />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full z-[60] p-6 mix-blend-difference">
                <Link to="/word-of-the-day" className="flex items-center gap-2 text-white font-medium hover:opacity-70 transition-opacity">
                    <ArrowLeft className="w-5 h-5" /> Back to Archive
                </Link>
            </nav>

            {/* Content */}
            <div className="relative pt-32 pb-24 px-4 md:px-6" style={{ zIndex: 10 }}>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="bg-black/85 backdrop-blur-lg border border-neutral-800 rounded-3xl overflow-hidden shadow-[0_-20px_80px_rgba(0,0,0,0.7)]">

                        {/* Card Header */}
                        <div className="p-8 md:p-12 lg:p-16 border-b border-neutral-800 relative">
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-white/10 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 text-white/80">
                                    {word.date} &bull; {word.category}
                                </span>
                                <h2
                                    className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-6"
                                    style={{ fontFamily: "var(--font-heading)" }}
                                >
                                    {word.title}
                                </h2>
                                <TextGenerateEffect
                                    words={word.definition}
                                    className="text-center mx-auto text-sm md:text-2xl italic text-white max-w-3xl leading-relaxed"
                                    duration={2}
                                />
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="flex flex-col-reverse lg:flex-row lg:min-h-[400px]">
                            {/* Explanation */}
                            <div className="w-full lg:w-1/2 p-8 md:p-12 lg:border-r border-neutral-800 flex flex-col justify-start text-left items-start">
                                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-6">Deep Dive</h3>
                                <div className="text-neutral-400 leading-relaxed text-base">
                                    {word.explanation.split('\n').map((para, i) => (
                                        <p key={i} className="mb-4">{para}</p>
                                    ))}
                                </div>
                                {word.readMoreUrl && (
                                    <a
                                        href={word.readMoreUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors self-start"
                                    >
                                        Read More <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>

                            {/* Right Column: Image + Example */}
                            <div className="w-full lg:w-1/2 flex flex-col bg-neutral-900 border-l border-neutral-800">
                                {/* Image Section (natural height) */}
                                <div className="relative overflow-hidden group">
                                    {word.imageUrl ? (
                                        <>
                                            <img
                                                src={word.imageUrl}
                                                alt={word.title}
                                                loading="lazy"
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
                                        "{word.example ? word.example : "No example provided for this word."}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Back to archive link at bottom */}
                <div className="max-w-5xl mx-auto mt-12 text-center">
                    <Link
                        to="/word-of-the-day"
                        className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to all words
                    </Link>
                </div>
            </div>
        </div>
    );
}
