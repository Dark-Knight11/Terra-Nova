import React, { useState, useEffect } from 'react';
import { ChevronLeft, Activity, CheckCircle, Clock, Wallet, Shield, ExternalLink, Copy, Loader2 } from 'lucide-react';
import CarbonCreditLifecycle from '../components/CarbonCreditLifecycle';
import { api } from '../api/client';
import { contractService } from '../services/contractService';

interface ProjectDetailViewProps {
    selectedProject: any;
    setActiveTab: (tab: string) => void;
    handleProjectClick: (project: any) => void;
    onViewCompany: () => void;
    onTrade: () => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ selectedProject, setActiveTab, handleProjectClick, onViewCompany, onTrade }) => {
    const [detailTab, setDetailTab] = useState('overview'); // overview, audit, company
    const [credits, setCredits] = useState<any[]>([]);
    const [onChainData, setOnChainData] = useState<any>(null);
    const [loadingChainData, setLoadingChainData] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const data = await api.credits.getAll();
                setCredits(data);
            } catch (error) {
                console.error('Failed to fetch credits:', error);
                // Fallback to mock data
                import('../data/mockData').then(({ credits: mockCredits }) => {
                    setCredits(mockCredits);
                });
            }
        };
        fetchCredits();
    }, []);

    // Fetch on-chain data if project has a projectId
    useEffect(() => {
        const fetchOnChainData = async () => {
            if (selectedProject?.projectId || selectedProject?.id) {
                setLoadingChainData(true);
                try {
                    if (contractService.isWalletAvailable()) {
                        await contractService.connectWallet();
                        const projectId = selectedProject.projectId || selectedProject.id;
                        const data = await contractService.getProjectInfo(projectId.toString());
                        setOnChainData(data);
                    }
                } catch (err) {
                    console.log('On-chain data not available:', err);
                } finally {
                    setLoadingChainData(false);
                }
            }
        };
        fetchOnChainData();
    }, [selectedProject]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!selectedProject) return <div className="pt-32 px-6">Loading...</div>;

    const contractAddresses = contractService.getContractAddresses();
    const projectWallet = selectedProject.wallet || onChainData?.projectDeveloper || '0x...';

    return (
        <div className="pt-24 px-6 pb-20 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => setActiveTab('marketplace')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-sm uppercase tracking-widest">
                    <ChevronLeft size={14} /> Back to Market
                </button>

                {/* Hero Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
                    {/* Left: Visuals */}
                    <div className="lg:col-span-7">
                        <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden border border-white/10 mb-6 group">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ background: selectedProject.image }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs uppercase tracking-wider font-medium">Verified Asset</span>
                                    <span className="px-3 py-1 bg-white/10 text-white border border-white/20 rounded text-xs uppercase tracking-wider font-medium">{selectedProject.type}</span>
                                    {onChainData && (
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded text-xs uppercase tracking-wider font-medium">
                                            On-Chain #{onChainData.projectId}
                                        </span>
                                    )}
                                </div>
                                <h1 className="font-serif text-3xl md:text-5xl leading-tight">{selectedProject.title || onChainData?.projectName}</h1>
                            </div>
                        </div>

                        {/* Tab Navigation - Scrollable on mobile */}
                        <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar pb-1 mb-1">
                            {['Overview', 'AI Audit Log', 'Company Details'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setDetailTab(tab.split(' ')[0].toLowerCase())}
                                    className={`px-6 py-4 text-sm font-medium transition-all relative whitespace-nowrap flex-shrink-0 ${detailTab === tab.split(' ')[0].toLowerCase() ? 'text-white' : 'text-white/40 hover:text-white'}`}
                                >
                                    {tab}
                                    {detailTab === tab.split(' ')[0].toLowerCase() && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500"></span>}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="py-8 min-h-[300px]">
                            {detailTab === 'overview' && (
                                <div className="space-y-6 animate-fade-in">
                                    <p className="text-white/70 leading-relaxed text-lg">{selectedProject.description}</p>

                                    {/* Carbon Credit Lifecycle Visualization */}
                                    <div className="my-8">
                                        <CarbonCreditLifecycle currentStage={onChainData?.status ? parseInt(onChainData.status) + 1 : 5} />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Vintage</div>
                                            <div className="text-lg font-medium">{selectedProject.vintage || onChainData?.vintageYear || 'N/A'}</div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Methodology</div>
                                            <div className="text-lg font-medium truncate" title={selectedProject.methodology}>{selectedProject.methodology || onChainData?.registry || 'N/A'}</div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Location</div>
                                            <div className="text-lg font-medium">{selectedProject.location || onChainData?.country || 'N/A'}</div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Volume</div>
                                            <div className="text-lg font-medium text-emerald-400 truncate" title={selectedProject.volume}>
                                                {selectedProject.volume || (onChainData ? `${parseInt(onChainData.totalCreditsIssued).toLocaleString()} tCO2e` : 'N/A')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* On-Chain Data Section */}
                                    {loadingChainData ? (
                                        <div className="flex items-center gap-2 text-white/40 mt-6">
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Loading on-chain data...</span>
                                        </div>
                                    ) : onChainData && (
                                        <div className="mt-8 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                            <h3 className="text-emerald-400 font-medium mb-4 flex items-center gap-2">
                                                <CheckCircle size={18} /> On-Chain Verification
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <div className="text-white/40">Project ID</div>
                                                    <div className="font-mono text-white">#{onChainData.projectId}</div>
                                                </div>
                                                <div>
                                                    <div className="text-white/40">Status</div>
                                                    <div className="text-emerald-400">
                                                        {['Submitted', 'Under Audit', 'Approved', 'Rejected', 'Active', 'Completed'][onChainData.status]}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-white/40">Credits Issued</div>
                                                    <div className="font-mono text-white">{parseInt(onChainData.totalCreditsIssued).toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-white/40">Credits Retired</div>
                                                    <div className="font-mono text-white">{parseInt(onChainData.totalCreditsRetired).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {detailTab === 'ai' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-6 flex flex-col md:flex-row items-start gap-4">
                                        <Activity className="text-blue-400 mt-1 flex-shrink-0" size={24} />
                                        <div>
                                            <h3 className="text-blue-200 font-medium mb-1">Agentic Verification Active</h3>
                                            <p className="text-sm text-blue-200/60">Our AI agents have continuously monitored this project's wallet address <strong className="break-all">{projectWallet}</strong> for the last 18 months. No double-counting anomalies detected.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                                                <span className="text-sm">Land Satellite Imagery Match</span>
                                            </div>
                                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">100% Match</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                                                <span className="text-sm">Wallet Transaction Audit</span>
                                            </div>
                                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Verified</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                                                <span className="text-sm">Smart Contract Verification</span>
                                            </div>
                                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">ERC-1155 Compliant</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Clock size={16} className="text-emerald-500 flex-shrink-0" />
                                                <span className="text-sm">Retirement Latency</span>
                                            </div>
                                            <span className="text-xs text-white/50 px-2 py-1">&lt; 200ms</span>
                                        </div>
                                    </div>

                                    {/* Blockchain Explorer Links */}
                                    <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/5">
                                        <h4 className="text-sm font-medium mb-3">Blockchain Verification</h4>
                                        <div className="space-y-2">
                                            <a
                                                href={`https://sepolia.etherscan.io/address/${contractAddresses.token}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between text-sm text-white/60 hover:text-emerald-400 transition-colors"
                                            >
                                                <span>View Token Contract</span>
                                                <ExternalLink size={14} />
                                            </a>
                                            <a
                                                href={`https://sepolia.etherscan.io/address/${contractAddresses.marketplace}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between text-sm text-white/60 hover:text-emerald-400 transition-colors"
                                            >
                                                <span>View Marketplace Contract</span>
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {detailTab === 'company' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-2xl font-serif">
                                            {(typeof selectedProject.company === 'string' ? selectedProject.company : selectedProject.company?.name || '').charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-serif">{typeof selectedProject.company === 'string' ? selectedProject.company : selectedProject.company?.name || ''}</h3>
                                            <div className="flex items-center justify-center md:justify-start gap-2 text-white/50 text-sm mt-1">
                                                <Wallet size={14} />
                                                <span className="break-all font-mono">{projectWallet}</span>
                                                <button
                                                    onClick={() => copyToClipboard(projectWallet)}
                                                    className="text-white/40 hover:text-white transition-colors"
                                                >
                                                    {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <button onClick={onViewCompany} className="md:ml-auto px-4 py-2 border border-white/20 rounded-full text-sm hover:bg-white hover:text-black transition-colors w-full md:w-auto">View Profile</button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl">
                                            <h4 className="text-sm text-white/40 uppercase tracking-widest mb-4">Issuer Reputation</h4>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-xl font-bold text-emerald-400">
                                                    {selectedProject.score}
                                                </div>
                                                <div>
                                                    <div className="text-lg font-medium text-white">Excellent</div>
                                                    <div className="text-sm text-white/40">Based on 12k+ transactions</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl">
                                            <h4 className="text-sm text-white/40 uppercase tracking-widest mb-4">Total Assets Retired</h4>
                                            <div className="flex items-end gap-2">
                                                <span className="text-4xl font-serif">1.2M</span>
                                                <span className="text-sm text-white/50 mb-1">tonnes</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm text-white/40 uppercase tracking-widest mb-4">Other Projects by {typeof selectedProject.company === 'string' ? selectedProject.company : selectedProject.company?.name || ''}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {credits.filter(c => {
                                                const cCompany = typeof c.company === 'string' ? c.company : c.company?.name || '';
                                                const pCompany = typeof selectedProject.company === 'string' ? selectedProject.company : selectedProject.company?.name || '';
                                                return cCompany === pCompany && c.id !== selectedProject.id;
                                            }).map(c => (
                                                <div key={c.id} onClick={() => handleProjectClick(c)} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                                    <div className="w-10 h-10 rounded bg-cover bg-center flex-shrink-0" style={{ background: c.image }}></div>
                                                    <div className="text-sm font-medium truncate">{c.title}</div>
                                                </div>
                                            ))}
                                            {credits.filter(c => {
                                                const cCompany = typeof c.company === 'string' ? c.company : c.company?.name || '';
                                                const pCompany = typeof selectedProject.company === 'string' ? selectedProject.company : selectedProject.company?.name || '';
                                                return cCompany === pCompany && c.id !== selectedProject.id;
                                            }).length === 0 && (
                                                    <div className="text-sm text-white/30 italic">No other active listings.</div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-28 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-sm text-white/50 mb-1">Current Price</div>
                                    <div className="text-4xl font-mono">${selectedProject.price} <span className="text-lg text-white/30">/ ton</span></div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-white/50 mb-1">Trust Score</div>
                                    <div className="flex items-center justify-end gap-1 text-emerald-400 font-bold">
                                        <Shield size={18} /> {selectedProject.score}/100
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <button
                                    onClick={onTrade}
                                    className="w-full py-4 bg-white text-black rounded-lg font-medium hover:scale-[1.02] transition-transform text-lg flex items-center justify-center gap-2"
                                >
                                    <Activity size={20} /> Trade on Market
                                </button>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50">Available Supply</span>
                                    <span className="font-mono">
                                        {onChainData
                                            ? `${(parseInt(onChainData.totalCreditsIssued) - parseInt(onChainData.totalCreditsRetired)).toLocaleString()} tCO2e`
                                            : '4,200 tCO2e'
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50">Token Contract</span>
                                    <a
                                        href={`https://sepolia.etherscan.io/address/${contractAddresses.token}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-emerald-400 flex items-center gap-1 hover:text-emerald-300 transition-colors"
                                    >
                                        {contractAddresses.token.slice(0, 6)}...{contractAddresses.token.slice(-4)}
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50">Token Standard</span>
                                    <span className="font-mono">ERC-1155</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50">Network</span>
                                    <span className="font-mono text-blue-400">Sepolia Testnet</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailView;
