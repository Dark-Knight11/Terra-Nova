import { useEffect, useRef } from 'react';
import { Globe, AlertTriangle, ShieldCheck, Layers, Eye, FileCheck, Leaf, Lock, RefreshCw, Server } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const AboutView = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            gsap.from(".animate-up", {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: ".animate-up",
                    start: "top 85%",
                }
            });

            gsap.utils.toArray('.feature-card').forEach((card: any, i) => {
                gsap.from(card, {
                    y: 30,
                    opacity: 0,
                    duration: 0.6,
                    delay: i * 0.1,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 90%",
                    }
                });
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="pt-24 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-32">
            {/* HERO SECTION */}
            <section className="text-center space-y-6 animate-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md mb-4">
                    <Globe size={14} className="text-emerald-400" />
                    <span className="text-xs uppercase tracking-widest text-emerald-200">Decentralized Carbon Credit Protocol</span>
                </div>
                <h1 className="font-serif text-5xl md:text-7xl leading-tight">
                    Rebuilding <span className="text-emerald-400 italic">Trust</span> in <br /> Carbon Markets
                </h1>
                <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
                    Using blockchain to create a transparent, efficient, and verifiable ecosystem for climate action.
                </p>
            </section>

            {/* CONTEXT SECTION */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="font-serif text-3xl md:text-4xl">Why Carbon Credits Matter</h2>
                    <p className="text-white/70 leading-relaxed">
                        Climate change is the defining challenge of our time. To combat it, we must incentivize emission reductions.
                        A carbon credit represents <strong>1 ton of CO₂ reduced</strong>. It allows companies to offset their unavoidable emissions while funding vital projects like reforestation and renewable energy.
                    </p>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h4 className="font-medium text-emerald-400 mb-2">The Simple Idea</h4>
                        <p className="text-sm text-white/60">
                            Solar farm generates clean energy → Earns Credits → Companies buy credits to offset emissions → Funding for more clean energy.
                        </p>
                    </div>
                </div>
                <div className="relative h-[400px] rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-emerald-900/20 to-black">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Leaf size={120} className="text-emerald-500/20 animate-float" />
                    </div>
                    <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/50">Offset Target</span>
                            <span className="text-emerald-400 font-mono">Net Zero</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-emerald-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROBLEM SECTION */}
            <section>
                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl md:text-4xl mb-4">The Broken System</h2>
                    <p className="text-white/60">Why the current carbon market is like a "messy second-hand market".</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { icon: AlertTriangle, title: "Hard to Verify", desc: "Buyers can't easily tell if a credit is real or just greenwashing. It's like buying a luxury bag without a certificate of authenticity." },
                        { icon: Layers, title: "Too Many Middlemen", desc: "Brokers, consultants, and auditors all take a cut, leaving less funding for the actual environmental projects." },
                        { icon: Eye, title: "No Transparency", desc: "Credits are siloed in different registries that don't talk to each other, making tracking difficult." },
                        { icon: RefreshCw, title: "Double Counting", desc: "The same credit is sometimes sold to multiple buyers, negating the actual environmental impact." },
                        { icon: FileCheck, title: "Weak Proof", desc: "Reliance on paper documents and manual audits instead of real-time, tamper-proof data." },
                    ].map((item, i) => (
                        <div key={i} className="feature-card p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <item.icon className="text-red-400 mb-6" size={32} />
                            <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                            <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SOLUTION SECTION */}
            <section className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="text-center mb-16 relative z-10">
                    <h2 className="font-serif text-3xl md:text-4xl mb-4">The DCCP Solution</h2>
                    <p className="text-white/60">Built on Ethereum for ultimate trust and transparency.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-8">
                        {[
                            { title: "Tokenized Credits", desc: "Every credit is a unique digital token (NFT) on the blockchain. Metadata includes location, project details, and verification docs.", icon: Lock },
                            { title: "Proof of Additionality", desc: "IoT devices and satellite oracles provide real-time data. Reforestation projects share GPS proof, verified on-chain.", icon: Server },
                            { title: "Direct Marketplace", desc: "A transparent platform like Amazon for carbon credits. Developers list directly, buyers see full history.", icon: Globe },
                            { title: "Permanent Retirement", desc: "When used, the token is 'burned', preventing resale. A digital retirement certificate is issued as permanent proof.", icon: ShieldCheck },
                        ].map((step, i) => (
                            <div key={i} className="feature-card flex gap-6 p-6 rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <step.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                                    <p className="text-white/60 text-sm">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Visual representation of the flow or retirement */}
                    <div className="bg-gradient-to-b from-white/5 to-transparent rounded-3xl p-8 border border-white/10 flex flex-col justify-center">
                        <h3 className="font-serif text-2xl mb-6">What is "Retiring"?</h3>
                        <div className="space-y-6">
                            <p className="text-white/70">
                                Just like a movie ticket that can't be used twice, a retired carbon credit is permanently taken out of circulation.
                            </p>
                            <div className="p-6 bg-emerald-900/20 rounded-xl border border-emerald-500/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <ShieldCheck className="text-emerald-400" />
                                    <span className="font-mono text-emerald-400">Retirement Certificate</span>
                                </div>
                                <div className="space-y-2 font-mono text-xs text-emerald-200/70">
                                    <div className="flex justify-between"><span>Status:</span> <span className="text-emerald-400">BURNED</span></div>
                                    <div className="flex justify-between"><span>Offset:</span> <span>1,000 tCO2e</span></div>
                                    <div className="flex justify-between"><span>Beneficiary:</span> <span>EcoCorp Global</span></div>
                                    <div className="flex justify-between"><span>TxHash:</span> <span>0x71...9A2</span></div>
                                </div>
                            </div>
                            <p className="text-sm text-white/50 italic">
                                This on-chain proof is immutable and publicly verifiable, perfect for sustainability reporting.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* IMPACT SECTION */}
            <section className="bg-white/5 rounded-3xl p-8 md:p-16 border border-white/10">
                <h2 className="font-serif text-3xl md:text-4xl mb-12 text-center">What We Achieve</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { title: "Transparency", desc: "Public ledger visibility for all credits." },
                        { title: "Lower Costs", desc: "Cutting out middlemen saves money." },
                        { title: "Fair Pricing", desc: "Direct market connection for better discovery." },
                        { title: "Trust & Proof", desc: "Immutable on-chain retirement certificates." },
                        { title: "Future-Ready", desc: "Compliance-ready for upcoming schemes like CCTS." },
                        { title: "Global Impact", desc: "More funding reaches actual climate projects." },
                    ].map((item, i) => (
                        <div key={i} className="feature-card flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-1">
                                <span className="text-black text-xs font-bold">✓</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                                <p className="text-white/50 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* VISION SECTION */}
            <section className="text-center max-w-4xl mx-auto space-y-8">
                <h2 className="font-serif text-4xl md:text-5xl">The Vision</h2>
                <p className="text-xl text-white/70 leading-relaxed">
                    This is more than a project; it's the foundation for a global decentralized carbon registry.
                    For developers, it's fair funding. For buyers, it's confidence. For the planet, it's real action.
                </p>
                <div className="inline-block px-8 py-4 rounded-full bg-emerald-500 text-black font-medium text-lg">
                    DCCP = The Future of Carbon Markets
                </div>
            </section>
        </div>
    );
};

export default AboutView;
