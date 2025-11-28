import { Cpu, Layers, Lock, Database, Server, User, Globe, FileCode, Activity, Zap, Clock, Save, Command } from 'lucide-react';

const DataFlowDiagram = () => {
    return (
        <div className="mt-20 p-8 border border-white/5 rounded-2xl bg-[#0a0a0a]/50 relative overflow-hidden overflow-x-auto">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]"></div>
            <div className="relative z-10 min-w-[1100px] h-[650px] flex items-center justify-center select-none">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" />
                        </marker>
                    </defs>

                    {/* User -> Frontend */}
                    <path d="M 200 100 L 300 100" stroke="#4B5563" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="5,5" />
                    <circle r="3" fill="#10B981"><animateMotion dur="2s" repeatCount="indefinite" path="M 200 100 L 300 100" /></circle>

                    {/* Frontend <-> Backend */}
                    <path d="M 350 100 L 480 100" stroke="#4B5563" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="5,5" />
                    <circle r="3" fill="#3B82F6"><animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M 350 100 L 480 100" /></circle>

                    {/* Backend -> Smart Contracts */}
                    <path d="M 600 100 L 750 60" stroke="#4B5563" strokeWidth="1" markerEnd="url(#arrowhead)" opacity="0.5" />
                    <path d="M 600 100 L 750 100" stroke="#4B5563" strokeWidth="1" markerEnd="url(#arrowhead)" opacity="0.5" />
                    <path d="M 600 100 L 750 140" stroke="#4B5563" strokeWidth="1" markerEnd="url(#arrowhead)" opacity="0.5" />

                    {/* Backend -> Agentic Layer (Orchestrator) */}
                    <path d="M 540 150 L 562 349" stroke="#F59E0B" strokeWidth="1" markerEnd="url(#arrowhead)" opacity="0.5" />
                    <circle r="2" fill="#F59E0B"><animateMotion dur="3s" repeatCount="indefinite" path="M 540 150 L 562 349" /></circle>

                    {/* Orchestrator -> Wallet Analyser */}
                    <path d="M 560 370 L 336 473" stroke="#F59E0B" strokeWidth="1" markerEnd="url(#arrowhead)" opacity="0.5" />
                    <circle r="2" fill="#F59E0B"><animateMotion dur="3s" repeatCount="indefinite" path="M 560 370 L 336 473" /></circle>

                    {/* Orchestrator -> Scoring Engine */}
                    <path d="M 565 380 L 510 553" stroke="#F59E0B" strokeWidth="1" markerEnd="url(#arrowhead)" opacity="0.5" />
                    <circle r="2" fill="#F59E0B"><animateMotion dur="3s" repeatCount="indefinite" path="M 565 380 L 510 553" /></circle>

                    {/* Orchestrator -> Scheduler */}
                    <path d="M 580 380 L 658 553" stroke="#F59E0B" strokeWidth="1" markerEnd="url(#arrowhead)" opacity="0.5" />
                    <circle r="2" fill="#F59E0B"><animateMotion dur="3s" repeatCount="indefinite" path="M 580 380 L 658 553" /></circle>

                    {/* Orchestrator -> Persister */}
                    <path d="M 584 370 L 798 463" stroke="#F59E0B" strokeWidth="1" markerEnd="url(#arrowhead)" opacity="0.5" />
                    <circle r="2" fill="#F59E0B"><animateMotion dur="3s" repeatCount="indefinite" path="M 584 370 L 798 463" /></circle>

                    {/* Wallets -> Analyser */}
                    <path d="M 190 495 L 322 471" stroke="#3B82F6" strokeWidth="1" markerEnd="url(#arrowhead)" opacity="0.5" />

                    {/* Persister -> Smart Contracts */}
                    <path d="M 810 457 C 890 400, 910 250, 850 140" stroke="#EF4444" strokeWidth="1" markerEnd="url(#arrowhead)" strokeDasharray="3,3" opacity="1.0" fill="none" />
                    <circle r="2" fill="#EF4444"><animateMotion dur="4s" repeatCount="indefinite" begin="2s" path="M 810 457 C 890 400, 910 250, 850 140" /></circle>

                </svg>

                {/* User */}
                <div className="absolute left-[150px] top-[70px] flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                        <User className="text-emerald-400" size={20} />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-white/50">User</span>
                </div>

                {/* Frontend */}
                <div className="absolute left-[300px] top-[70px] flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-lg bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                        <Globe className="text-blue-400" size={20} />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-white/50">Frontend</span>
                </div>

                {/* Backend */}
                <div className="absolute left-[480px] top-[55px] flex flex-col items-center gap-2">
                    <div className="w-28 h-20 rounded-lg bg-[#0a0a0a] border border-white/10 flex flex-col items-center justify-center px-2">
                        <Server className="text-purple-400" size={24} />
                        <span className="text-[8px] text-white/40 mt-1">Auth • Calls</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-white/50">Backend</span>
                </div>

                {/* Smart Contracts Cluster */}
                <div className="absolute left-[750px] top-[20px] p-4 border border-white/5 rounded-xl bg-white/5 backdrop-blur-sm w-[200px]">
                    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-3 text-center">Smart Contracts</div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-2 py-1 bg-black/30 rounded border border-orange-500/20">
                            <FileCode size={12} className="text-orange-400" />
                            <span className="text-[8px] text-white/60">Minting</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-black/30 rounded border border-orange-500/20">
                            <FileCode size={12} className="text-orange-400" />
                            <span className="text-[8px] text-white/60">Selling</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-black/30 rounded border border-orange-500/20">
                            <FileCode size={12} className="text-orange-400" />
                            <span className="text-[8px] text-white/60">Burning/Certificate</span>
                        </div>
                    </div>
                </div>

                {/* Agentic Layer Box */}
                <div className="absolute top-[265px] left-[120px] right-[200px] bottom-[20px] border border-emerald-500/10 rounded-3xl bg-emerald-500/[0.02]">
                    <div className="absolute top-3 left-5 text-[10px] uppercase tracking-widest text-emerald-400/60">5-Agent System</div>

                    {/* Orchestrator (Center) */}
                    <div className="absolute left-[400px] top-[82px] flex flex-col items-center gap-2 z-10">
                        <div className="w-16 h-16 rounded-full bg-[#0a0a0a] border border-emerald-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] relative">
                            <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-20"></div>
                            <Command className="text-emerald-400" size={26} />
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Orchestrator</span>
                    </div>

                    {/* Wallet Analyser */}
                    <div className="absolute left-[180px] top-[180px] flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                            <Activity className="text-blue-400" size={18} />
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-white/50">Wallet Analyser</span>
                    </div>

                    {/* Wallets (External) */}
                    <div className="absolute left-[30px] top-[210px] flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-lg bg-[#0a0a0a] border border-blue-500/20 flex items-center justify-center">
                            <Database className="text-blue-300" size={16} />
                        </div>
                        <span className="text-[7px] text-white/40">Wallets</span>
                    </div>

                    {/* Scoring Engine */}
                    <div className="absolute left-[350px] top-[270px] flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                            <Zap className="text-yellow-400" size={18} />
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-white/50">Scoring Engine</span>
                    </div>

                    {/* Scheduler */}
                    <div className="absolute left-[510px] top-[270px] flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                            <Clock className="text-purple-400" size={18} />
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-white/50">Scheduler</span>
                        <span className="text-[7px] text-white/30">(Daily)</span>
                    </div>

                    {/* Persister */}
                    <div className="absolute left-[660px] top-[180px] flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                            <Save className="text-red-400" size={18} />
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-white/50">Persister</span>
                        <span className="text-[7px] text-white/30">(Monthly)</span>
                    </div>
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
                        Handles all data visualization, registration/login forms, and wallet scoring filters. Enables querying, bidding, and listing of carbon credits.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Visualization', 'Forms', 'Bidding', 'Listing', 'Filtering'].map(tag => (
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
                        Three core contracts for Minting, Selling, and Burning/Certificate Generation. Ensures immutable and transparent carbon credit operations.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Minting', 'Selling', 'Burning', 'Certificates'].map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 rounded border border-white/5">{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Layer 3 */}
                <div className="group bg-[#0a0a0a]/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:border-purple-500/50 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-900/20 border border-purple-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Database className="text-purple-400" />
                    </div>
                    <h3 className="font-serif text-2xl mb-4">Backend Layer</h3>
                    <p className="text-sm text-white/50 text-sm leading-relaxed mb-4">
                        Manages authentication/registration of companies, auditors, and registries. Handles linked address data and orchestrates smart contract calls.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Auth', 'Registration', 'Data Mgmt', 'Contract Calls'].map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 rounded border border-white/5">{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Layer 4 */}
                <div className="group bg-[#0a0a0a]/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:border-orange-500/50 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-900/20 border border-orange-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Cpu className="text-orange-400" />
                    </div>
                    <h3 className="font-serif text-2xl mb-4">Agentic Layer</h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-4">
                        5-Agent System: Analyzes company wallets, scores based on audit attempts and failures, runs daily scoring engine, and persists scores on-chain monthly.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Orchestrator', 'Analyser', 'Scorer', 'Scheduler', 'Persister'].map(tag => (
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
