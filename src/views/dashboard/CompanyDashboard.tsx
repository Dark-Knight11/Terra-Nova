import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import { contractService, ProjectCategory, GasType } from '../../services/contractService';
import type { ProjectInfo, Listing } from '../../services/contractService';
import { Loader2, Wallet, AlertCircle, TrendingUp, Package, Clock, Plus, Tag, ExternalLink, Coins, FileText, UploadCloud, CheckCircle, X } from 'lucide-react';
import ProjectDetailsModal from '../../components/dashboard/ProjectDetailsModal';
import CreateListingModal from '../../components/dashboard/CreateListingModal';

interface NewProjectState {
    projectName: string;
    category: number;
    gasType: number;
    country: string;
    registry: string;
    consultant: string;
    verificationDocHash: string;
    vintageYear: number;
}

const CompanyDashboard: React.FC = () => {
    const { user } = useAuth();
    const [walletConnected, setWalletConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [mintingProjectId, setMintingProjectId] = useState<string | null>(null);
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [listings, setListings] = useState<Listing[]>([]);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [showListingModal, setShowListingModal] = useState(false);

    const [newProject, setNewProject] = useState<NewProjectState>({
        projectName: '',
        category: ProjectCategory.Reforestation,
        gasType: GasType.CO2,
        country: '',
        registry: 'Verra',
        consultant: '',
        verificationDocHash: '',
        vintageYear: new Date().getFullYear()
    });

    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        initializeDashboard();
    }, [user]);

    const initializeDashboard = async () => {
        setLoading(true);
        try {
            // If user has a persisted wallet address, use it to fetch data
            if (user?.walletAddress) {
                setWalletConnected(true);
                await fetchUserData(user.walletAddress);
            } else if (contractService.isWalletAvailable()) {
                // Optional: Check if already connected in MetaMask without prompting
                // For now, we rely on the DB persistence as requested
            }
        } catch (err) {
            console.error('Failed to initialize dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        try {
            setError(null);
            await contractService.connectWallet();
            setWalletConnected(true);
            const address = contractService.getConnectedAddress();
            if (address) await fetchUserData(address);
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet');
        }
    };

    const fetchUserData = async (address?: string) => {
        try {
            const targetAddress = address || user?.walletAddress || contractService.getConnectedAddress();

            if (!targetAddress) {
                console.warn('No wallet address available to fetch user data');
                return;
            }

            // Get user's projects using the provided address
            const projectIds = await contractService.getDeveloperProjects();
            const projectPromises = projectIds.map(id => contractService.getProjectInfo(id));
            const projectInfos = await Promise.all(projectPromises);
            setProjects(projectInfos.filter((p): p is ProjectInfo => p !== null));

            // Get user's listings
            const listingIds = await contractService.getSellerListings(targetAddress);
            const listingPromises = listingIds.map(id => contractService.getListing(id));
            const listingInfos = await Promise.all(listingPromises);
            setListings(listingInfos.filter(l => l !== null));
        } catch (err) {
            console.error('Failed to fetch user data:', err);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Validate file type/size if needed
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError("File size exceeds 10MB limit");
                return;
            }
            setSelectedFile(file);
            simulateUpload(file);
        }
    };

    const simulateUpload = (file: File) => {
        setUploading(true);
        setUploadProgress(0);
        setError(null);
        console.log(`Starting upload for ${file.name}...`);

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploading(false);
                    // Generate mock IPFS hash
                    const mockHash = `ipfs://Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
                    setNewProject(prev => ({ ...prev, verificationDocHash: mockHash }));
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        setNewProject(prev => ({ ...prev, verificationDocHash: '' }));
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure wallet is actually connected before submitting
        try {
            await contractService.connectWallet();
        } catch (err) {
            setError("Please connect your wallet to submit a project.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const result = await contractService.submitProject(
                newProject.projectName,
                newProject.category,
                newProject.gasType,
                newProject.country,
                newProject.registry,
                newProject.consultant || '0x0000000000000000000000000000000000000000',
                newProject.verificationDocHash || `ipfs://project-${Date.now()}`,
                newProject.vintageYear
            );

            // Sync with backend API
            try {
                const creditTypeMap: Record<number, string> = {
                    0: 'RENEWABLE_ENERGY',
                    1: 'REFORESTATION',
                    2: 'RENEWABLE_ENERGY',
                    3: 'PRESERVATION',
                    4: 'BLUE_CARBON',
                    5: 'PRESERVATION',
                    6: 'PRESERVATION'
                };

                await api.credits.create({
                    title: newProject.projectName,
                    type: creditTypeMap[newProject.category] || 'REFORESTATION',
                    price: 0, // Initial price
                    location: newProject.country,
                    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop', // Default image
                    description: `Project ID: ${result.projectId}. Registry: ${newProject.registry}. Consultant: ${newProject.consultant}`,
                    vintage: newProject.vintageYear.toString(),
                    volume: '0', // Initial volume
                    methodology: newProject.registry
                });
                console.log('Project synced to backend successfully');
            } catch (apiErr) {
                console.error('Failed to sync project to backend:', apiErr);
                // Don't fail the UI flow since blockchain tx succeeded
            }

            setSuccess(`Project submitted successfully! Project ID: ${result.projectId}`);
            setShowCreateProject(false);
            setNewProject({
                projectName: '',
                category: ProjectCategory.Reforestation,
                gasType: GasType.CO2,
                country: '',
                registry: 'Verra',
                consultant: '',
                verificationDocHash: '',
                vintageYear: new Date().getFullYear()
            });

            await fetchUserData();
        } catch (err: any) {
            console.error('Failed to create project:', err);
            setError(err.message || 'Failed to submit project');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMintCredits = async (projectId: string) => {
        try {
            await contractService.connectWallet();
        } catch (err) {
            setError("Please connect your wallet to mint credits.");
            return;
        }

        setMintingProjectId(projectId);
        setError(null);

        try {
            // Mint 1000 credits for demo
            await contractService.mintCredits(projectId, "1000");
            setSuccess(`Successfully minted 1000 credits for Project #${projectId}`);
            await fetchUserData();
        } catch (err: any) {
            console.error('Failed to mint credits:', err);
            setError(err.message || 'Failed to mint credits');
        } finally {
            setMintingProjectId(null);
        }
    };



    const handleViewProject = (project: ProjectInfo) => {
        setSelectedProject(project);
        setShowDetailsModal(true);
    };

    const handleListProject = (project: ProjectInfo) => {
        setSelectedProject(project);
        setShowListingModal(true);
    };

    const getCategoryLabel = (category: number) => {
        const labels = ['Renewable Energy', 'Reforestation', 'Energy Efficiency', 'Waste Management', 'Ocean Conservation', 'Soil Carbon', 'Other'];
        return labels[category] || 'Unknown';
    };

    const getStatusLabel = (status: number) => {
        const labels = ['Submitted', 'Under Audit', 'Approved', 'Rejected', 'Active', 'Completed'];
        return labels[status] || 'Unknown';
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 0: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 1: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 2:
            case 4: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 3: return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 5: return 'bg-white/5 text-white/40 border-white/10';
            default: return 'bg-white/5 text-white/40 border-white/10';
        }
    };

    // Calculate stats
    const totalCreditsIssued = projects.reduce((sum, p) => sum + parseInt(p.totalCreditsIssued || '0'), 0);
    const activeListings = listings.filter(l => l.status === 0).length;
    const pendingProjects = projects.filter(p => p.status === 0 || p.status === 1).length;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin w-8 h-8 text-emerald-500" />
            </div>
        );
    }

    if (!walletConnected) {
        return (
            <div className="text-center py-20">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <h3 className="text-xl font-serif mb-2">Connect Your Wallet</h3>
                <p className="text-white/50 mb-6">Connect your wallet to view your dashboard and manage projects</p>
                <button
                    onClick={connectWallet}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg transition-colors"
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    const disconnectWallet = () => {
        setWalletConnected(false);
        setProjects([]);
        setListings([]);
    };

    return (
        <div className="space-y-8">
            {/* Header with Wallet Info */}
            <div className="flex justify-between items-center bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6">
                <div>
                    <h2 className="text-2xl font-serif text-white">Company Dashboard</h2>
                    <p className="text-white/40 text-sm">Manage your carbon credit projects and listings</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-white/40 uppercase tracking-wider">Connected Wallet</div>
                        <div className="font-mono text-emerald-400">
                            {contractService.getConnectedAddress()?.slice(0, 6)}...{contractService.getConnectedAddress()?.slice(-4)}
                        </div>
                    </div>
                    <button
                        onClick={disconnectWallet}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg transition-colors text-sm"
                    >
                        Disconnect
                    </button>
                </div>
            </div>
            {/* Alerts */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto">×</button>
                </div>
            )}
            {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400">
                    <TrendingUp size={20} />
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)} className="ml-auto">×</button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <Package size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-serif text-white mb-1">{projects.length}</div>
                    <div className="text-sm text-white/40">Total Projects</div>
                </div>

                <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-serif text-white mb-1">{totalCreditsIssued.toLocaleString()}</div>
                    <div className="text-sm text-white/40">Credits Issued (tCO2e)</div>
                </div>

                <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <Package size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-serif text-white mb-1">{activeListings}</div>
                    <div className="text-sm text-white/40">Active Listings</div>
                </div>

                <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-serif text-white mb-1">{pendingProjects}</div>
                    <div className="text-sm text-white/40">Pending Verification</div>
                </div>
            </div>

            {/* My Projects */}
            <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-serif text-white">My Projects</h3>
                    <button
                        onClick={() => setShowCreateProject(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-medium rounded-lg transition-colors"
                    >
                        <Plus size={16} /> New Project
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package className="w-12 h-12 mx-auto mb-4 text-white/20" />
                        <p className="text-white/50 mb-4">You haven't submitted any projects yet</p>
                        <button
                            onClick={() => setShowCreateProject(true)}
                            className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                        >
                            Submit Your First Project
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-white/60">
                            <thead className="bg-white/5 text-white/40 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Project ID</th>
                                    <th className="px-6 py-4 font-medium">Name</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Credits</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {projects.map((project) => (
                                    <tr key={project.projectId} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-emerald-400">#{project.projectId}</td>
                                        <td className="px-6 py-4 text-white font-medium">{project.projectName}</td>
                                        <td className="px-6 py-4">{getCategoryLabel(project.category)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white">{parseInt(project.totalCreditsIssued).toLocaleString()}</span>
                                                <span className="text-xs text-white/30">Issued</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(project.status)}`}>
                                                {getStatusLabel(project.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">



                                                {/* List Button */}
                                                <button
                                                    onClick={() => handleListProject(project)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                                >
                                                    <Tag size={16} />
                                                    List on Marketplace
                                                </button>
                                                {/* View Button */}
                                                <button
                                                    onClick={() => handleViewProject(project)}
                                                    className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* My Listings */}
            {listings.length > 0 && (
                <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-lg font-serif text-white">My Marketplace Listings</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-white/60">
                            <thead className="bg-white/5 text-white/40 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Listing ID</th>
                                    <th className="px-6 py-4 font-medium">Project ID</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Price (ETH)</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {listings.map((listing) => (
                                    <tr key={listing.listingId} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono">#{listing.listingId}</td>
                                        <td className="px-6 py-4 font-mono text-emerald-400">#{listing.projectId}</td>
                                        <td className="px-6 py-4">{listing.amount}</td>
                                        <td className="px-6 py-4 text-emerald-400">{listing.currentPrice}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs border ${listing.status === 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                listing.status === 1 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-white/5 text-white/40 border-white/10'
                                                }`}>
                                                {listing.status === 0 ? 'Active' : listing.status === 1 ? 'Completed' : 'Cancelled'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Project Modal */}
            {showCreateProject && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-serif">Submit New Project</h3>
                            <button onClick={() => setShowCreateProject(false)} className="text-white/40 hover:text-white">×</button>
                        </div>

                        <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={newProject.projectName}
                                    onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                    placeholder="e.g., Amazon Reforestation Initiative"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Category</label>
                                    <select
                                        value={newProject.category}
                                        onChange={(e) => setNewProject({ ...newProject, category: parseInt(e.target.value) })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                    >
                                        <option value={ProjectCategory.RenewableEnergy}>Renewable Energy</option>
                                        <option value={ProjectCategory.Reforestation}>Reforestation</option>
                                        <option value={ProjectCategory.EnergyEfficiency}>Energy Efficiency</option>
                                        <option value={ProjectCategory.WasteManagement}>Waste Management</option>
                                        <option value={ProjectCategory.OceanConservation}>Ocean Conservation</option>
                                        <option value={ProjectCategory.SoilCarbon}>Soil Carbon</option>
                                        <option value={ProjectCategory.Other}>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Primary Gas</label>
                                    <select
                                        value={newProject.gasType}
                                        onChange={(e) => setNewProject({ ...newProject, gasType: parseInt(e.target.value) })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                    >
                                        <option value={GasType.CO2}>CO2</option>
                                        <option value={GasType.Methane}>Methane</option>
                                        <option value={GasType.CO}>CO</option>
                                        <option value={GasType.N2O}>N2O</option>
                                        <option value={GasType.Other}>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Country</label>
                                    <input
                                        type="text"
                                        value={newProject.country}
                                        onChange={(e) => setNewProject({ ...newProject, country: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                        placeholder="e.g., Brazil"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Vintage Year</label>
                                    <input
                                        type="number"
                                        value={newProject.vintageYear}
                                        onChange={(e) => setNewProject({ ...newProject, vintageYear: parseInt(e.target.value) })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                        min="2020"
                                        max="2030"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Registry</label>
                                <select
                                    value={newProject.registry}
                                    onChange={(e) => setNewProject({ ...newProject, registry: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                >
                                    <option value="Verra">Verra (VCS)</option>
                                    <option value="Gold Standard">Gold Standard</option>
                                    <option value="ACR">American Carbon Registry</option>
                                    <option value="CAR">Climate Action Reserve</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Verification Document</label>

                                {!selectedFile ? (
                                    <div className="border-2 border-dashed border-white/10 rounded-lg p-6 hover:border-emerald-500/30 transition-colors text-center group cursor-pointer relative">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleFileSelect}
                                            accept=".pdf,.doc,.docx"
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-white/5 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                                                <UploadCloud className="w-6 h-6 text-white/40 group-hover:text-emerald-400" />
                                            </div>
                                            <p className="text-sm text-white/60 font-medium">Click to upload verification document</p>
                                            <p className="text-xs text-white/30">PDF, DOC up to 10MB</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                    <FileText className="w-5 h-5 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                                                    <p className="text-xs text-white/40">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-emerald-500 h-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>

                                        {uploadProgress === 100 && (
                                            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400">
                                                <CheckCircle size={12} />
                                                <span>Upload complete</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Hidden input to maintain form logic if needed, though we update state directly */}
                                <input
                                    type="hidden"
                                    value={newProject.verificationDocHash}
                                    required
                                />
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <button
                                    type="submit"
                                    disabled={submitting || uploading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-medium py-3 rounded-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {(submitting || uploading) && <Loader2 className="animate-spin w-4 h-4" />}
                                    {uploading ? 'Uploading Document...' : 'Submit Project'}
                                </button>
                                <p className="text-xs text-white/40 text-center mt-3">
                                    Your project will be reviewed by an auditor before credits can be issued.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedProject && (
                <ProjectDetailsModal
                    project={selectedProject}
                    onClose={() => setShowDetailsModal(false)}
                />
            )}

            {/* Listing Modal */}
            {showListingModal && selectedProject && (
                <CreateListingModal
                    projectId={selectedProject.projectId}
                    maxAmount={parseInt(selectedProject.totalCreditsIssued) - parseInt(selectedProject.totalCreditsRetired)}
                    onClose={() => setShowListingModal(false)}
                    onSuccess={() => {
                        setSuccess('Listing created successfully!');
                        fetchUserData();
                    }}
                />
            )}
        </div>
    );
};

export default CompanyDashboard;
