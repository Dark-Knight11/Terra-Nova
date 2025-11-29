import { Wallet, FileText, Vote, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { contractService } from '../services/contractService';
import { useAuth } from '../contexts/AuthContext';

const GovernanceView = () => {
    const { } = useAuth();
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [walletConnected, setWalletConnected] = useState(false);

    const [votingPower, setVotingPower] = useState('0');
    const [pendingWithdrawals, setPendingWithdrawals] = useState('0');
    const [withdrawing, setWithdrawing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        initializeGovernance();
    }, []);

    const initializeGovernance = async () => {
        setLoading(true);
        try {
            // Fetch proposals from API
            const data = await api.proposals.getAll();
            setProposals(data);
        } catch (error) {
            console.error('Failed to fetch proposals:', error);
            // Fallback to mock data
            import('../data/mockData').then(({ proposals: mockProposals }) => {
                setProposals(mockProposals);
            });
        }

        // Check wallet connection
        try {
            if (contractService.isWalletAvailable()) {
                await contractService.connectWallet();
                setWalletConnected(true);


                // Get voting power (total token balance)
                const balance = await contractService.getTotalBalance();
                setVotingPower(balance);

                // Get pending withdrawals from marketplace
                const pending = await contractService.getPendingWithdrawals();
                setPendingWithdrawals(pending);
            }
        } catch (err) {
            console.log('Wallet connection optional:', err);
        } finally {
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        try {
            setError(null);
            await contractService.connectWallet();
            setWalletConnected(true);


            const balance = await contractService.getTotalBalance();
            setVotingPower(balance);

            const pending = await contractService.getPendingWithdrawals();
            setPendingWithdrawals(pending);
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet');
        }
    };

    const handleWithdraw = async () => {
        if (parseFloat(pendingWithdrawals) <= 0) return;

        setWithdrawing(true);
        setError(null);

        try {
            const txHash = await contractService.withdrawFunds();
            setSuccess(`Withdrawal successful! TX: ${txHash.slice(0, 10)}...`);
            setPendingWithdrawals('0');
        } catch (err: any) {
            setError(err.message || 'Withdrawal failed');
        } finally {
            setWithdrawing(false);
        }
    };

    const contractAddresses = contractService.getContractAddresses();

    // Calculate stats
    const activeProposals = proposals.filter(p => p.status?.toLowerCase() === 'active').length;
    const totalVotes = proposals.reduce((sum, p) => sum + (p.votesFor || 0) + (p.votesAgainst || 0), 0);

    return (
        <div className="pt-32 px-6 pb-20 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="font-serif text-5xl mb-2">Governance</h1>
                        <p className="text-white/50">Decentralized decision making for the Carbon Block Protocol.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-lg text-right w-full md:w-auto">
                        <div className="text-xs text-white/40 uppercase tracking-widest">Your Voting Power</div>
                        <div className="font-mono text-xl text-emerald-400">
                            {walletConnected ? `${parseInt(votingPower).toLocaleString()} vTN` : '0.00 vTN'}
                        </div>
                        {!walletConnected && (
                            <button
                                onClick={connectWallet}
                                className="text-xs text-emerald-400 hover:text-emerald-300 mt-1"
                            >
                                Connect to view
                            </button>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto">×</button>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400">
                        <Vote size={20} />
                        <span>{success}</span>
                        <button onClick={() => setSuccess(null)} className="ml-auto">×</button>
                    </div>
                )}

                {/* Stats Row - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-2 text-white/40">
                            <Wallet size={16} /> <span className="text-xs uppercase tracking-wider">Pending Withdrawals</span>
                        </div>
                        <div className="text-2xl font-serif text-emerald-400">{pendingWithdrawals} ETH</div>
                        {parseFloat(pendingWithdrawals) > 0 && (
                            <button
                                onClick={handleWithdraw}
                                disabled={withdrawing}
                                className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                            >
                                {withdrawing ? <Loader2 size={12} className="animate-spin" /> : null}
                                Withdraw
                            </button>
                        )}
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-2 text-white/40">
                            <FileText size={16} /> <span className="text-xs uppercase tracking-wider">Active Proposals</span>
                        </div>
                        <div className="text-2xl font-serif">{activeProposals}</div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-2 text-white/40">
                            <Vote size={16} /> <span className="text-xs uppercase tracking-wider">Total Votes Cast</span>
                        </div>
                        <div className="text-2xl font-serif">{totalVotes.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-2 text-white/40">
                            <Wallet size={16} /> <span className="text-xs uppercase tracking-wider">Network</span>
                        </div>
                        <div className="text-lg font-mono text-blue-400">Sepolia</div>
                    </div>
                </div>

                {/* Contract Links */}
                <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="text-sm font-medium mb-3 text-white/60">Smart Contracts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <a
                            href={`https://sepolia.etherscan.io/address/${contractAddresses.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <span className="text-white/60">Token Contract</span>
                            <span className="flex items-center gap-1 text-emerald-400 font-mono text-xs">
                                {contractAddresses.token.slice(0, 8)}...
                                <ExternalLink size={12} />
                            </span>
                        </a>
                        <a
                            href={`https://sepolia.etherscan.io/address/${contractAddresses.marketplace}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <span className="text-white/60">Marketplace</span>
                            <span className="flex items-center gap-1 text-emerald-400 font-mono text-xs">
                                {contractAddresses.marketplace.slice(0, 8)}...
                                <ExternalLink size={12} />
                            </span>
                        </a>
                        <a
                            href={`https://sepolia.etherscan.io/address/${contractAddresses.nft}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <span className="text-white/60">NFT Contract</span>
                            <span className="flex items-center gap-1 text-emerald-400 font-mono text-xs">
                                {contractAddresses.nft.slice(0, 8)}...
                                <ExternalLink size={12} />
                            </span>
                        </a>
                    </div>
                </div>

                {/* Proposals List */}
                <div className="space-y-6">
                    <h3 className="text-xl font-serif border-b border-white/10 pb-4">Recent Proposals</h3>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin w-8 h-8 text-emerald-500" />
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className="text-center py-12 text-white/40">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No proposals yet. Be the first to create one!</p>
                        </div>
                    ) : (
                        proposals.map((prop) => (
                            <div key={prop.id} className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${prop.status?.toLowerCase() === 'active' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                                prop.status?.toLowerCase() === 'passed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                                    'bg-red-500/10 border-red-500/30 text-red-400'
                                                }`}>
                                                {prop.status}
                                            </span>
                                            <span className="text-white/30 text-xs">ID: #{prop.id}</span>
                                        </div>
                                        <h4 className="text-lg font-medium">{prop.title}</h4>
                                    </div>
                                    <div className="text-right text-xs text-white/40">
                                        {prop.status?.toLowerCase() === 'active' ? `Ends in ${prop.end}` : `Status: ${prop.end}`}
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

                                {prop.status?.toLowerCase() === 'active' && walletConnected && parseInt(votingPower) > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
                                        <button className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors">
                                            Vote For
                                        </button>
                                        <button className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors">
                                            Vote Against
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Create Proposal CTA */}
                {walletConnected && parseInt(votingPower) > 0 && (
                    <div className="mt-12 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                        <h3 className="text-lg font-serif mb-2">Have a proposal?</h3>
                        <p className="text-white/50 text-sm mb-4">
                            Token holders can create proposals to improve the Carbon Block protocol.
                        </p>
                        <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg transition-colors">
                            Create Proposal
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GovernanceView;
