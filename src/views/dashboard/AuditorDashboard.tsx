import React from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const AuditorDashboard: React.FC = () => {
    // Mock Data
    const stats = [
        { label: 'Pending Audits', value: '12', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { label: 'Completed Audits', value: '145', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Flagged Projects', value: '3', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    ];

    const audits = [
        { id: 1, project: 'Reforestation Project Beta', company: 'GreenEarth Co.', date: '2023-10-25', status: 'In Progress', priority: 'High' },
        { id: 2, project: 'Clean Water Initiative', company: 'AquaPure Ltd.', date: '2023-10-20', status: 'Completed', priority: 'Medium' },
        { id: 3, project: 'Urban Solar Grid', company: 'CityPower Inc.', date: '2023-10-28', status: 'Pending', priority: 'Low' },
        { id: 4, project: 'Biomass Energy Plant', company: 'BioGen Corp.', date: '2023-10-15', status: 'Flagged', priority: 'High' },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <div className="text-3xl font-serif text-white">{stat.value}</div>
                        </div>
                        <div className="text-sm text-white/40">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Audits Table */}
            <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-serif text-white">Audit Queue</h3>
                    <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">View History</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/60">
                        <thead className="bg-white/5 text-white/40 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Project Name</th>
                                <th className="px-6 py-4 font-medium">Company</th>
                                <th className="px-6 py-4 font-medium">Submission Date</th>
                                <th className="px-6 py-4 font-medium">Priority</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {audits.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">{item.project}</td>
                                    <td className="px-6 py-4">{item.company}</td>
                                    <td className="px-6 py-4">{item.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium ${item.priority === 'High' ? 'text-red-400' :
                                            item.priority === 'Medium' ? 'text-yellow-400' :
                                                'text-emerald-400'
                                            }`}>
                                            {item.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs border ${item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            item.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                item.status === 'Flagged' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-white/5 text-white/40 border-white/10'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-white/40 hover:text-white transition-colors">Review</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditorDashboard;
