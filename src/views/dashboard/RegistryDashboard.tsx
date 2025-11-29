import React, { useState, useEffect } from 'react';
import { contractService } from '../../services/contractService';
import type { ProjectInfo } from '../../services/contractService';
import { ProjectStatus } from '../../services/contractService';
import { Coins, CheckCircle } from 'lucide-react';

interface RegistryDashboardProps {
    connectedAddress: string | null;
}

export const RegistryDashboard: React.FC<RegistryDashboardProps> = () => {
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [showMintCredits, setShowMintCredits] = useState(false);

    // Form states
    const [mintAmount, setMintAmount] = useState('1000');
    const [monitoringReportHash, setMonitoringReportHash] = useState('');
    const [submitting, setSubmitting] = useState(false);
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

        setSubmitting(true);
        setError(null);

        try {
            const reportHash = monitoringReportHash || `ipfs://monitoring-${Date.now()}`;
            await contractService.mintCredits(selectedProject.projectId, mintAmount, reportHash);
            setSuccess(`${mintAmount} credits minted for project #${selectedProject.projectId}`);
            setShowMintCredits(false);
            setMintAmount('1000');
            setMonitoringReportHash('');
            await fetchProjects();
        } catch (err: any) {
            console.error('Failed to mint credits:', err);
            setError(err.message || 'Failed to mint credits');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white text-xl">Loading projects...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Registry Dashboard</h1>
                <p className="text-gray-400 mb-8">Mint carbon credits for approved projects</p>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                <div className="mb-6 flex items-center gap-2 text-gray-400">
                    <CheckCircle size={20} />
                    <span>Approved Projects Awaiting Credits: {projects.length}</span>
                </div>

                {/* Project List */}
                <div className="grid gap-6">
                    {projects.length === 0 ? (
                        <div className="text-center text-gray-400 py-12 bg-gray-800/50 rounded-lg border border-gray-700">
                            No approved projects awaiting credit minting
                        </div>
                    ) : (
                        projects.map((project) => (
                            <div key={project.projectId} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-emerald-500/50 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">{project.projectName}</h3>
                                        <p className="text-gray-400 text-sm">Project ID: #{project.projectId}</p>
                                        <p className="text-gray-400 text-sm">Developer: {project.projectDeveloper.slice(0, 10)}...</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
                                        Approved
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Country:</span>
                                        <span className="text-white ml-2">{project.country}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Registry:</span>
                                        <span className="text-white ml-2">{project.registry}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Vintage Year:</span>
                                        <span className="text-white ml-2">{project.vintageYear}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Credits Issued:</span>
                                        <span className="text-white ml-2">{project.totalCreditsIssued}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => {
                                            setSelectedProject(project);
                                            setShowMintCredits(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                    >
                                        <Coins size={16} />
                                        Mint Credits
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Mint Credits Modal */}
                {showMintCredits && selectedProject && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-white mb-4">Mint Credits</h2>
                            <p className="text-gray-400 mb-4">Project: {selectedProject.projectName}</p>

                            <input
                                type="number"
                                placeholder="Amount of credits"
                                value={mintAmount}
                                onChange={(e) => setMintAmount(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg mb-4"
                            />

                            <input
                                type="text"
                                placeholder="Monitoring Report Hash (optional)"
                                value={monitoringReportHash}
                                onChange={(e) => setMonitoringReportHash(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg mb-4"
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={handleMintCredits}
                                    disabled={submitting || !mintAmount}
                                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {submitting ? 'Minting...' : 'Mint'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMintCredits(false);
                                        setMintAmount('1000');
                                        setMonitoringReportHash('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistryDashboard;
