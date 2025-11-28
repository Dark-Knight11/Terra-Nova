import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Activity } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MarketCard from '../components/MarketCard';
import { api } from '../api/client';

interface HomeViewProps {
    setActiveTab: (tab: string) => void;
    handleProjectClick: (project: any) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setActiveTab, handleProjectClick }) => {
    const comp = useRef(null);
    const [credits, setCredits] = useState<any[]>([]);
    const [wallets, setWallets] = useState<any[]>([]);

    useEffect(() => {
        // Fetch credits and wallets from API
        const fetchData = async () => {
            try {
                const [creditsData, walletsData] = await Promise.all([
                    api.credits.getAll({ limit: 4 }),
                    api.wallets.getAll({ limit: 4 })
                ]);
                setCredits(creditsData);
                setWallets(walletsData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                // Fallback to mock data
                import('../data/mockData').then(({ credits: mockCredits, wallets: mockWallets }) => {
                    setCredits(mockCredits);
                    setWallets(mockWallets);
                });
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            gsap.from(".hero-title", { y: 100, opacity: 0, duration: 1.5, ease: "power4.out", stagger: 0.1 });
            gsap.utils.toArray('.market-card-preview').forEach((card: any, i: number) => {
                gsap.from(card, {
                    scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" },
                    y: 50, opacity: 0, duration: 0.8, delay: i * 0.1
                });
            });
            // Removed conflicting .ai-graphic animation to keep the 3D tilt stable
        }, comp);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={comp}>
            {/* HERO */}
            <section className="relative h-screen flex flex-col justify-center items-center px-6 pt-20">
                <div className="text-center max-w-5xl mx-auto space-y-8">
                    <div className="hero-title inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs uppercase tracking-widest text-white/70">Blockchain Verified Registry</span>
                    </div>
                    <h1 className="hero-title font-serif text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight">
                        <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/30">The Universal</span>
                        <span className="block italic text-emerald-400/90 font-light">Carbon Ledger</span>
                    </h1>
                    <p className="hero-title text-white/50 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        A decentralized marketplace for secure, transparent, and audited carbon credit trading. Powered by AI-driven verification.
                    </p>
                    <div className="hero-title flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
                        <button onClick={() => setActiveTab('marketplace')} className="px-8 py-4 bg-white text-black rounded-full font-medium hover:scale-105 transition-transform duration-300 flex items-center gap-2">
                            Explore Market <ArrowRight size={18} />
                        </button>
                        <button onClick={() => setActiveTab('technology')} className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-medium hover:bg-white/5 transition-colors duration-300">
                            Our Technology
                        </button>
                    </div>
                </div>
            </section>

            {/* PREVIEW MARKET */}
            <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-transparent to-[#020202]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <h2 className="font-serif text-4xl mb-4">Trending Assets</h2>
                            <p className="text-white/40">Real-time listings from verified developers.</p>
                        </div>
                        <button onClick={() => setActiveTab('marketplace')} className="text-emerald-400 hover:text-white flex items-center gap-2">View All <ArrowRight size={16} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {credits.slice(0, 4).map((credit) => (
                            <MarketCard key={credit.id} credit={credit} className="market-card-preview" onClick={() => handleProjectClick(credit)} />
                        ))}
                    </div>
                </div>
            </section>

            {/* AI SECTION */}
            <section className="ai-section relative py-32 px-6 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-6">
                            <Activity size={14} className="text-blue-400" />
                            <span className="text-xs uppercase tracking-widest text-blue-200">AI Agentic Layer</span>
                        </div>
                        <h2 className="font-serif text-4xl md:text-6xl mb-6">Autonomous <br /> Audit & Scoring</h2>
                        <p className="text-white/60 text-lg mb-8 leading-relaxed">
                            AI agents analyze wallet history to generate dynamic Trust Scores, preventing double-counting.
                        </p>
                        <button onClick={() => setActiveTab('technology')} className="text-blue-400 hover:text-white transition-colors flex items-center gap-2 group">
                            View Architecture <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <div className="ai-graphic order-1 lg:order-2 relative perspective-[2000px]">
                        <div className="relative z-10 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl transform transition-transform duration-500 hover:scale-105 overflow-hidden">
                            <div className="absolute left-0 w-full h-[2px] bg-blue-400 animate-scan z-20"></div>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-mono text-white/50">LIVE_SCANNER_V2.0</h3>
                                <div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="w-2 h-2 rounded-full bg-yellow-500"></span><span className="w-2 h-2 rounded-full bg-green-500"></span></div>
                            </div>
                            <div className="space-y-4">
                                {wallets.map((wallet, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs ${wallet.score > 90 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {wallet.score}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-white">{wallet.entity}</div>
                                                <div className="text-xs text-white/40 font-mono">{wallet.id}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomeView;
