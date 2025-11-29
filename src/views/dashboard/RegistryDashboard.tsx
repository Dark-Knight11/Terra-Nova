import React, { useState, useEffect } from 'react';
import { contractService } from '../../services/contractService';
import type { ProjectInfo } from '../../services/contractService';
import { ProjectStatus } from '../../services/contractService';
import { Coins, CheckCircle, RefreshCw } from 'lucide-react';

interface RegistryDashboardProps {
    connectedAddress: string | null;
}

export const RegistryDashboard: React.FC<RegistryDashboardProps> = () => {
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [showMintModal, setShowMintModal] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Form states
    const [mintAmount, setMintAmount] = useState('1000');
    const [monitoringReportHash, setMonitoringReportHash] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const allProjects = await contractService.getAllProjects();
            // Show only approved projects that need credits minted
            setProjects(allProjects.filter(p => p.status === ProjectStatus.Approved));
        } catch (err: any) {
            console.error('Failed to fetch projects:', err);
            setError(err.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleMintCredits = async () => {
        if (!selectedProject) return;

        setProcessingId(selectedProject.projectId);
        setError(null);

        try {
            // Connect wallet first
            await contractService.connectWallet();

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));

            const reportHash = monitoringReportHash || `ipfs://monitoring-${Date.now()}`;
            await contractService.mintCredits(selectedProject.projectId, mintAmount, reportHash);

            setSuccess(`${mintAmount} credits minted for project #${selectedProject.projectId}`);
            setShowMintModal(false);
            setMintAmount('1000');
            setMonitoringReportHash('');

            // Refresh projects after a delay
            setTimeout(() => fetchProjects(), 2000);
        } catch (err: any) {
            console.error('Failed to mint credits:', err);

            // Better error messages
            if (err.message.includes('rate limit')) {
                setError('Rate limit exceeded. Please wait a few seconds and try again.');
            } else if (err.message.includes('AccessControl')) {
                setError('You do not have REGISTRY_ROLE. Please contact admin.');
            } else {
                setError(err.message || 'Failed to mint credits');
            }
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusLabel = (status: number) => {
        const labels = ['Submitted', 'Under Audit', 'Approved', 'Rejected', 'Active', 'Completed'];
        return labels[status] || 'Unknown';
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 2: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-white/40 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <CheckCircle size={20} />
                        </div>
                        <div className="text-3xl font-serif text-white">{projects.length}</div>
                    </div>
                    <div className="text-sm text-white/40">Approved Projects</div>
                </div>
                <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 opacity-50">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                            <Coins size={20} />
                        </div>
                        <div className="text-3xl font-serif text-white">-</div>
                    </div>
                    <div className="text-sm text-white/40">Credits Minted</div>
                </div>
                <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 opacity-50">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                            <Coins size={20} />
                        </div>
                        <div className="text-3xl font-serif text-white">-</div>
                    </div>
                    <div className="text-sm text-white/40">Total Volume</div>
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-400">
                    {success}
                </div>
            )}

            {/* Projects Table */}
            <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-serif text-white">Approved Projects</h3>
                    <button
                        onClick={fetchProjects}
                        disabled={loading}
                        className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
                <div className="overflow-x-auto">
                    {loading && projects.length === 0 ? (
                        <div className="p-8 text-center text-white/40">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className="p-8 text-center text-white/40">No approved projects awaiting credit minting</div>
                    ) : (
                        <table className="w-full text-left text-sm text-white/60">
                            <thead className="bg-white/5 text-white/40 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Project Name</th>
                                    <th className="px-6 py-4 font-medium">Developer</th>
                                    <th className="px-6 py-4 font-medium">Vintage</th>
                                    <th className="px-6 py-4 font-medium">Credits Issued</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {projects.map((project) => (
                                    <tr key={project.projectId} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{project.projectName}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{project.projectDeveloper.substring(0, 6)}...{project.projectDeveloper.substring(38)}</td>
                                        <td className="px-6 py-4">{project.vintageYear}</td>
                                        <td className="px-6 py-4">{project.totalCreditsIssued}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(project.status)}`}>
                                                {getStatusLabel(project.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setShowMintModal(true);
                                                }}
                                                disabled={processingId === project.projectId}
                                                className="text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processingId === project.projectId ? 'Minting...' : 'Mint Credits'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Mint Credits Modal */}
            {showMintModal && selectedProject && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-serif text-white mb-4">Mint Credits</h2>
                        <p className="text-white/60 mb-6">Project: {selectedProject.projectName}</p>

                        <input
                            type="number"
                            placeholder="Amount of credits"
                            value={mintAmount}
                            onChange={(e) => setMintAmount(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg mb-4 focus:outline-none focus:border-emerald-500/50"
                        />

                        <input
                            type="text"
                            placeholder="Monitoring Report Hash (optional)"
                            value={monitoringReportHash}
                            onChange={(e) => setMonitoringReportHash(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg mb-6 focus:outline-none focus:border-emerald-500/50"
                        />

                        <div className="flex gap-4">
                            <button
                                onClick={handleMintCredits}
                                disabled={processingId !== null || !mintAmount}
                                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                            >
                                {processingId ? 'Minting...' : 'Mint'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowMintModal(false);
                                    setMintAmount('1000');
                                    setMonitoringReportHash('');
                                }}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistryDashboard;
