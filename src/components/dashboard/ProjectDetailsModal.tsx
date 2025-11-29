import React from 'react';
import { X, Globe, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';
import type { ProjectInfo } from '../../services/contractService';

interface ProjectDetailsModalProps {
    project: ProjectInfo;
    onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, onClose }) => {
    const getCategoryLabel = (category: number) => {
        const labels = ['Renewable Energy', 'Reforestation', 'Energy Efficiency', 'Waste Management', 'Ocean Conservation', 'Soil Carbon', 'Other'];
        return labels[category] || 'Unknown';
    };

    const getGasLabel = (gasType: number) => {
        const labels = ['CO2', 'Methane', 'CO', 'N2O', 'Other'];
        return labels[gasType] || 'Unknown';
    };

    const getStatusLabel = (status: number) => {
        const labels = ['Submitted', 'Under Audit', 'Approved', 'Rejected', 'Active', 'Completed'];
        return labels[status] || 'Unknown';
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 0: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 1: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 2:
            case 4: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 3: return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-white/40 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-serif text-white">{project.projectName}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(project.status)}`}>
                                {getStatusLabel(project.status)}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/50">
                            <span className="font-mono text-emerald-400">#{project.projectId}</span>
                            <span className="flex items-center gap-1"><Globe size={14} /> {project.country}</span>
                            <span className="flex items-center gap-1"><Calendar size={14} /> Vintage: {project.vintageYear}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Credits Issued</div>
                            <div className="text-2xl font-mono text-emerald-400">{parseInt(project.totalCreditsIssued).toLocaleString()}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Credits Retired</div>
                            <div className="text-2xl font-mono text-blue-400">{parseInt(project.totalCreditsRetired).toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                                <FileText size={16} className="text-emerald-500" /> Project Details
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-white/40">Category</span>
                                    <span className="text-white/80">{getCategoryLabel(project.category)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-white/40">Primary Gas</span>
                                    <span className="text-white/80">{getGasLabel(project.primaryGasType)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-white/40">Registry</span>
                                    <span className="text-white/80">{project.registry}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                                <CheckCircle size={16} className="text-emerald-500" /> Verification
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-white/40">Developer</span>
                                    <span className="text-white/60 font-mono text-xs truncate max-w-[150px]" title={project.projectDeveloper}>
                                        {project.projectDeveloper}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-white/40">Auditor</span>
                                    <span className="text-white/60 font-mono text-xs truncate max-w-[150px]" title={project.auditor}>
                                        {project.auditor === '0x0000000000000000000000000000000000000000' ? 'Pending Assignment' : project.auditor}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-white/40">Created</span>
                                    <span className="text-white/80">{new Date(project.createdAt * 1000).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Status */}
                    <div>
                        <h4 className="text-sm font-medium text-white/80 mb-4 flex items-center gap-2">
                            <Clock size={16} className="text-emerald-500" /> Project Timeline
                        </h4>
                        <div className="relative pl-4 border-l border-white/10 space-y-8">
                            {/* 1. Submitted */}
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#0a0a0a]"></div>
                                <div className="text-sm font-medium text-white">Project Submitted</div>
                                <div className="text-xs text-white/40 mt-1">{new Date(project.createdAt * 1000).toLocaleString()}</div>
                                <div className="text-xs text-white/30 mt-0.5 font-mono">
                                    By: {project.projectDeveloper.substring(0, 6)}...{project.projectDeveloper.substring(38)}
                                </div>
                            </div>

                            {/* 2. Under Audit */}
                            <div className="relative">
                                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-[#0a0a0a] ${project.status >= 1 ? 'bg-blue-500' : 'bg-white/10'
                                    }`}></div>
                                <div className={`text-sm font-medium ${project.status >= 1 ? 'text-white' : 'text-white/40'}`}>
                                    Under Audit
                                </div>
                                {project.status >= 1 ? (
                                    <>
                                        <div className="text-xs text-white/40 mt-1">
                                            {project.status > 1 ? 'Audit Completed' : 'In Progress'}
                                        </div>
                                        {project.auditor !== '0x0000000000000000000000000000000000000000' && (
                                            <div className="text-xs text-white/30 mt-0.5 font-mono">
                                                Auditor: {project.auditor.substring(0, 6)}...{project.auditor.substring(38)}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-xs text-white/20 mt-1">Pending Review</div>
                                )}
                            </div>

                            {/* 3. Approval / Rejection */}
                            {(project.status === 2 || project.status === 3 || project.status === 0 || project.status === 1) && (
                                <div className="relative">
                                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-[#0a0a0a] ${project.status === 2 ? 'bg-emerald-500' :
                                            project.status === 3 ? 'bg-red-500' : 'bg-white/10'
                                        }`}></div>
                                    <div className={`text-sm font-medium ${project.status >= 2 ? 'text-white' : 'text-white/40'}`}>
                                        {project.status === 3 ? 'Project Rejected' : 'Project Approved'}
                                    </div>
                                    {project.status === 2 && (
                                        <div className="text-xs text-white/40 mt-1">
                                            {new Date(project.approvedAt * 1000).toLocaleString()}
                                        </div>
                                    )}
                                    {project.status < 2 && (
                                        <div className="text-xs text-white/20 mt-1">Pending Approval</div>
                                    )}
                                </div>
                            )}

                            {/* 4. Issuance */}
                            <div className="relative">
                                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-[#0a0a0a] ${parseInt(project.totalCreditsIssued) > 0 ? 'bg-emerald-500' : 'bg-white/10'
                                    }`}></div>
                                <div className={`text-sm font-medium ${parseInt(project.totalCreditsIssued) > 0 ? 'text-white' : 'text-white/40'}`}>
                                    Credits Issued
                                </div>
                                {parseInt(project.totalCreditsIssued) > 0 ? (
                                    <div className="text-xs text-white/40 mt-1">
                                        Total: {parseInt(project.totalCreditsIssued).toLocaleString()} Credits
                                    </div>
                                ) : (
                                    <div className="text-xs text-white/20 mt-1">Pending Issuance</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsModal;
