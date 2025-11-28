import React from 'react';
import { Cpu, Layers, Lock, Database, ArrowRight, User, Globe, ShieldCheck, Zap } from 'lucide-react';

const DataFlowDiagram = () => {
    return (
        <div className="mt-20 p-8 border border-white/5 rounded-2xl bg-[#0a0a0a]/50 relative overflow-hidden overflow-x-auto">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]"></div>
            <div className="relative z-10 min-w-[800px] h-[400px] flex items-center justify-center select-none">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <linearGradient id="grad-line" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
                            <stop offset="50%" stopColor="#10B981" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                        </linearGradient>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
                        </marker>
                    </defs>

                    {/* Paths */}
                    {/* User -> Frontend */}
                    <path d="M 120 200 L 280 200" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="5,5" />
                    <circle r="3" fill="#10B981">
                        <animateMotion dur="2s" repeatCount="indefinite" path="M 120 200 L 280 200" />
                    </circle>

                    {/* Frontend -> Contract */}
                    <path d="M 320 200 L 480 200" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="5,5" />
                    <circle r="3" fill="#3B82F6">
                        <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M 320 200 L 480 200" />
                    </circle>

                    {/* Contract -> AI Agent */}
                    <path d="M 520 200 C 550 200, 550 100, 680 100" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="5,5" fill="none" />
                    <circle r="3" fill="#F59E0B">
                        <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 520 200 C 550 200, 550 100, 680 100" />
                    </circle>

                    {/* Contract -> Database */}
                    <path d="M 520 200 C 550 200, 550 300, 680 300" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="5,5" fill="none" />
                    <circle r="3" fill="#8B5CF6">
                        <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 520 200 C 550 200, 550 300, 680 300" />
                    </circle>

                    {/* AI Agent -> Contract (Feedback) */}
                    <path d="M 680 130 C 600 130, 600 180, 520 190" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="5,5" fill="none" opacity="0.5" />
                    <circle r="2" fill="#EF4444">
                        <animateMotion dur="3s" repeatCount="indefinite" begin="2s" path="M 680 130 C 600 130, 600 180, 520 190" />
                    </circle>

                </svg>

                {/* Nodes */}
                {/* User */}
                <div className="absolute left-[50px] top-[170px] flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <User className="text-emerald-400" />
                    </div>
                    <span className="text-xs uppercase tracking-widest text-white/50">User</span>
                </div>

                {/* Frontend */}
                <div className="absolute left-[250px] top-[170px] flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                        <Globe className="text-blue-400" />
                    </div>
                    <span className="text-xs uppercase tracking-widest text-white/50">Frontend</span>
                </div>

                {/* Smart Contract */}
                <div className="absolute left-[450px] top-[170px] flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.1)] relative">
                        <div className="absolute inset-0 border border-orange-500/20 rounded-xl animate-ping opacity-20"></div>
                        <ShieldCheck className="text-orange-400" />
                    </div>
                    <span className="text-xs uppercase tracking-widest text-white/50">Smart Contract</span>
                </div>

                {/* AI Agent */}
                <div className="absolute left-[650px] top-[70px] flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <Zap className="text-red-400" />
                    </div>
                    <span className="text-xs uppercase tracking-widest text-white/50">AI Verifier</span>
                </div>

                {/* Database */}
                <div className="absolute left-[650px] top-[270px] flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-lg bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                        <Database className="text-purple-400" />
                    </div>
                    <span className="text-xs uppercase tracking-widest text-white/50">Off-Chain Data</span>
                </div>
            </div>
        </div>
    );
};

const TechnologyView = () => (
    <div className="pt-32 px-6 pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-4">
                    <Cpu size={14} className="text-blue-400" />
                    <span className="text-xs uppercase tracking-widest text-blue-200">Architecture v1.0</span>
                </div>
                <h1 className="font-serif text-5xl md:text-6xl mb-6">The Tech Stack</h1>
                <p className="text-white/50 text-lg max-w-2xl mx-auto">
                    A multi-layered ecosystem ensuring scalability, security, and integrity.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Layer 1 */}
                <div className="group bg-[#0a0a0a]/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:border-emerald-500/50 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Layers className="text-emerald-400" />
                    </div>
                    <h3 className="font-serif text-2xl mb-4">Frontend Layer</h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-4">
                        Handles visualization, marketplace interaction, and wallet connection. Built for high-performance rendering.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Next.js', 'React', 'Three.js', 'GSAP'].map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 rounded border border-white/5">{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Layer 2 */}
                <div className="group bg-[#0a0a0a]/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:border-blue-500/50 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-900/20 border border-blue-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Lock className="text-blue-400" />
                    </div>
                    <h3 className="font-serif text-2xl mb-4">Smart Contracts</h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-4">
                        Immutable logic for minting, selling, burning, and certificate generation. Ensures zero double-counting.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Solidity', 'ERC-721', 'Escrow', 'Polygon'].map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 rounded border border-white/5">{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Layer 3 */}
                <div className="group bg-[#0a0a0a]/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:border-purple-500/50 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-900/20 border border-purple-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Database className="text-purple-400" />
                    </div>
                    <h3 className="font-serif text-2xl mb-4">Backend & Data</h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-4">
                        Manages off-chain data, authentication, caching, and registry synchronization.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Node.js', 'PostgreSQL', 'GraphQL', 'Auth0'].map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 rounded border border-white/5">{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Layer 4 */}
                <div className="group bg-[#0a0a0a]/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:border-orange-500/50 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-900/20 border border-orange-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Cpu className="text-orange-400" />
                    </div>
                    <h3 className="font-serif text-2xl mb-4">Agentic AI</h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-4">
                        Autonomous agents that score wallets, audit project data, and detect anomalies in real-time.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Python', 'TensorFlow', 'NLP', 'Vector DB'].map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 rounded border border-white/5">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            <DataFlowDiagram />
        </div>
    </div>
);

export default TechnologyView;
