import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, Clock, Plus, Loader2, ExternalLink, Wallet, AlertCircle, Coins, Tag } from 'lucide-react';
import { contractService, ProjectCategory, GasType, type ProjectInfo } from '../../services/contractService';
import { useAuth } from '../../contexts/AuthContext';
import ProjectDetailsModal from '../../components/dashboard/ProjectDetailsModal';
import CreateListingModal from '../../components/dashboard/CreateListingModal';

const CompanyDashboard: React.FC = () => {
    const { user: _user } = useAuth();
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [listings, setListings] = useState<any[]>([]);
    const [totalBalance, setTotalBalance] = useState('0');
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Modal State
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showListingModal, setShowListingModal] = useState(false);
    const [mintingProjectId, setMintingProjectId] = useState<string | null>(null);

    // Form state for new project
    const [newProject, setNewProject] = useState({
        projectName: '',
        category: ProjectCategory.Reforestation,
        gasType: GasType.CO2,
        country: '',
        registry: 'Verra',
        consultant: '',
        verificationDocHash: '',
        vintageYear: new Date().getFullYear()
    });

    useEffect(() => {
        initializeDashboard();
    }, []);

    const initializeDashboard = async () => {
        setLoading(true);
        try {
            if (contractService.isWalletAvailable()) {
                const address = await contractService.connectWallet();
                setWalletConnected(true);
                setWalletAddress(address);
                await fetchUserData();
            }
        } catch (err) {
            console.error('Failed to initialize dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    // ... (keep existing code)

    // In the render method, use walletAddress to suppress unused warning or remove it if truly not needed.
    // For now, I'll just comment that we might use it for display later.

    // ...

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Category</label>
                                    <select
                                        value={newProject.category}
                                        onChange={(e) => setNewProject({ ...newProject, category: parseInt(e.target.value) as ProjectCategory })}
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
                                        onChange={(e) => setNewProject({ ...newProject, gasType: parseInt(e.target.value) as GasType })}
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
                                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Verification Document (IPFS Hash)</label>
                                <input
                                    type="text"
                                    value={newProject.verificationDocHash}
                                    onChange={(e) => setNewProject({ ...newProject, verificationDocHash: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                    placeholder="ipfs://..."
                                />
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-medium py-3 rounded-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {submitting && <Loader2 className="animate-spin w-4 h-4" />}
                                    Submit Project
                                </button>
                                <p className="text-xs text-white/40 text-center mt-3">
                                    Your project will be reviewed by an auditor before credits can be issued.
                                </p>
                            </div>
                        </form >
                    </div >
                </div >
            )}

{/* Details Modal */ }
{
    showDetailsModal && selectedProject && (
        <ProjectDetailsModal
            project={selectedProject}
            onClose={() => setShowDetailsModal(false)}
        />
    )
}

{/* Listing Modal */ }
{
    showListingModal && selectedProject && (
        <CreateListingModal
            projectId={selectedProject.projectId}
            maxAmount={parseInt(selectedProject.totalCreditsIssued) - parseInt(selectedProject.totalCreditsRetired)}
            onClose={() => setShowListingModal(false)}
            onSuccess={() => {
                setSuccess('Listing created successfully!');
                fetchUserData();
            }}
        />
    )
}
        </div >
    );
};

export default CompanyDashboard;
