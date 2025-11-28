import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { contractService, AUDITOR_ROLE, REGISTRY_ROLE, type ProjectInfo } from '../../services/contractService';

const AuditorDashboard: React.FC = () => {
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const [hasAuditorRole, setHasAuditorRole] = useState<boolean>(true);
    const [hasRegistryRole, setHasRegistryRole] = useState<boolean>(true);

    useEffect(() => {
        checkRole();
        loadProjects();
    }, []);

    const checkRole = async () => {
        try {
            const address = contractService.getConnectedAddress();
            if (address) {
                const isAuditor = await contractService.hasRole(AUDITOR_ROLE, address);
                const isRegistry = await contractService.hasRole(REGISTRY_ROLE, address);
                setHasAuditorRole(isAuditor);
                setHasRegistryRole(isRegistry);
            }
        } catch (error) {
            console.error("Failed to check role", error);
        }
    };

    const loadProjects = async () => {
        setLoading(true);
        try {
            const allProjects = await contractService.getAllProjects();
            // Filter for Submitted (0) or Under Audit (1)
            const pending = allProjects.filter(p => p.status === 0 || p.status === 1);
            setProjects(pending);
        } catch (error) {
            console.error("Failed to load projects", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (project: ProjectInfo) => {
        if (!hasRegistryRole) {
            alert("You do not have the Registry role required to approve projects. Please contact the admin.");
            return;
        }
        setProcessingId(project.projectId);
        try {
            // If project is Submitted (0), we must assign it first
            if (project.status === 0) {
                const address = contractService.getConnectedAddress();
                if (!address) throw new Error("Wallet not connected");

                console.log("Assigning auditor...");
                await contractService.assignAuditor(project.projectId, address);
                // Wait a bit for the chain to update
                await new Promise(r => setTimeout(r, 2000));
            }

            console.log("Approving project...");
            await contractService.approveProject(project.projectId);

            // Refresh after approval
            await loadProjects();
        } catch (error: any) {
            console.error("Failed to approve project", error);
            if (error.message.includes("AccessControl")) {
                alert("Transaction reverted: Missing Permissions (Registry Role).");
            } else {
                // Check for specific revert reasons if possible
                alert("Failed to approve project. Ensure you have the required roles and the project is in a valid state.");
            }
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusLabel = (status: number) => {
        switch (status) {
            case 0: return 'Submitted';
            case 1: return 'Under Audit';
            case 2: return 'Approved';
            case 3: return 'Rejected';
            default: return 'Unknown';
        }
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 0: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 1: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 2: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 3: return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-white/40 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="space-y-8">
            {(!hasAuditorRole || !hasRegistryRole) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400">
                    <AlertTriangle size={24} />
                    <div>
                        <h4 className="font-medium">Missing Permissions</h4>
                        <p className="text-sm opacity-80">
                            {!hasAuditorRole && "You are missing the Auditor Role. "}
                            {!hasRegistryRole && "You are missing the Registry Role (required for approval). "}
                            Please run the <code>grant_auditor_role.ts</code> script with the admin key.
                        </p>
                    </div>
                </div>
            )}
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                            <Clock size={20} />
                        </div>
                        <div className="text-3xl font-serif text-white">{projects.length}</div>
                    </div>
                    <div className="text-sm text-white/40">Pending Audits</div>
                </div>
                {/* Placeholders for other stats */}
                <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 opacity-50">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <CheckCircle size={20} />
                        </div>
                        <div className="text-3xl font-serif text-white">-</div>
                    </div>
                    <div className="text-sm text-white/40">Completed Audits</div>
                </div>
                <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 opacity-50">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                            <AlertTriangle size={20} />
                        </div>
                        <div className="text-3xl font-serif text-white">-</div>
                    </div>
                    <div className="text-sm text-white/40">Flagged Projects</div>
                </div>
            </div>

            {/* Audits Table */}
            <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-serif text-white">Audit Queue</h3>
                    <button
                        onClick={loadProjects}
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
                        <div className="p-8 text-center text-white/40">No pending audits found.</div>
                    ) : (
                        <table className="w-full text-left text-sm text-white/60">
                            <thead className="bg-white/5 text-white/40 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Project Name</th>
                                    <th className="px-6 py-4 font-medium">Developer</th>
                                    <th className="px-6 py-4 font-medium">Vintage</th>
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
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(project.status)}`}>
                                                {getStatusLabel(project.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleApprove(project)}
                                                disabled={processingId === project.projectId}
                                                className="text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processingId === project.projectId ? 'Approving...' : 'Approve'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditorDashboard;
