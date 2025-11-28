import { Wallet, FileText, Vote } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api/client';

const GovernanceView = () => {
    const [proposals, setProposals] = useState<any[]>([]);

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const data = await api.proposals.getAll();
                setProposals(data);
            } catch (error) {
                console.error('Failed to fetch proposals:', error);
                // Fallback to mock data
                import('../data/mockData').then(({ proposals: mockProposals }) => {
                    setProposals(mockProposals);
                });
            }
        };
        fetchProposals();
    }, []);

    return (
        <div className="pt-32 px-6 pb-20 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="font-serif text-5xl mb-2">Governance</h1>
                        <p className="text-white/50">Decentralized decision making for the DCCP Protocol.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-lg text-right w-full md:w-auto">
                        <div className="text-xs text-white/40 uppercase tracking-widest">Your Voting Power</div>
                        <div className="font-mono text-xl text-emerald-400">0.00 vDCCP</div>
                    </div>
                </div>

                {/* Stats Row - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-2 text-white/40">
                            <Wallet size={16} /> <span className="text-xs uppercase tracking-wider">Treasury Balance</span>
                        </div>
                        <div className="text-2xl font-serif">$2,450,890</div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-2 text-white/40">
                            <FileText size={16} /> <span className="text-xs uppercase tracking-wider">Active Proposals</span>
                        </div>
                        <div className="text-2xl font-serif">4</div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-2 text-white/40">
                            <Vote size={16} /> <span className="text-xs uppercase tracking-wider">Total Votes Cast</span>
                        </div>
                        <div className="text-2xl font-serif">12,405</div>
                    </div>
                </div>

                {/* Proposals List */}
                <div className="space-y-6">
                    <h3 className="text-xl font-serif border-b border-white/10 pb-4">Recent Proposals</h3>
                    {proposals.map((prop) => (
                        <div key={prop.id} className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${prop.status.toLowerCase() === 'active' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                            prop.status.toLowerCase() === 'passed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                                'bg-red-500/10 border-red-500/30 text-red-400'
                                            }`}>
                                            {prop.status}
                                        </span>
                                        <span className="text-white/30 text-xs">ID: #{prop.id}</span>
                                    </div>
                                    <h4 className="text-lg font-medium">{prop.title}</h4>
                                </div>
                                <div className="text-right text-xs text-white/40">
                                    {prop.status.toLowerCase() === 'active' ? `Ends in ${prop.end}` : `Status: ${prop.end}`}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-white/60">
                                    <span>For: {prop.votesFor}%</span>
                                    <span>Against: {prop.votesAgainst}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-emerald-500" style={{ width: `${prop.votesFor}%` }}></div>
                                    <div className="h-full bg-red-500" style={{ width: `${prop.votesAgainst}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export default GovernanceView;
