import React from 'react';
import { Globe, ShieldCheck, BarChart3, Search } from 'lucide-react';

const RegistryDashboard: React.FC = () => {
    // Mock Data
    const stats = [
        { label: 'Total Verified Credits', value: '2.5M', unit: 'tCO2e', icon: ShieldCheck },
        { label: 'Total Retired Credits', value: '1.2M', unit: 'tCO2e', icon: Globe },
        { label: 'Active Projects', value: '342', unit: '', icon: BarChart3 },
    ];

    const verifiedCredits = [
        { id: 'VCS-1023', project: 'Amazon Rainforest Conservation', vintage: '2023', amount: '50,000', status: 'Issued', holder: 'GreenEarth Co.' },
        { id: 'GS-405', project: 'Solar Farm Project Alpha', vintage: '2022', amount: '35,000', status: 'Retired', holder: 'TechGiant Corp.' },
        { id: 'ACR-221', project: 'Mangrove Restoration Initiative', vintage: '2023', amount: '25,000', status: 'Issued', holder: 'EcoFund' },
        { id: 'VCS-1024', project: 'Wind Power Expansion', vintage: '2023', amount: '40,000', status: 'Issued', holder: 'CleanEnergy Ltd.' },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 flex items-center gap-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-emerald-400 border border-white/5">
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-serif text-white">{stat.value}</div>
                            <div className="text-sm text-white/40">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/20" size={20} />
                <input
                    type="text"
                    placeholder="Search by Serial Number, Project Name, or Holder..."
                    className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
            </div>

            {/* Verified Credits Table */}
            <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-serif text-white">Registry Ledger</h3>
                    <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">Export Data</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/60">
                        <thead className="bg-white/5 text-white/40 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Serial Number</th>
                                <th className="px-6 py-4 font-medium">Project Name</th>
                                <th className="px-6 py-4 font-medium">Vintage</th>
                                <th className="px-6 py-4 font-medium">Amount (tCO2e)</th>
                                <th className="px-6 py-4 font-medium">Current Holder</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {verifiedCredits.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-emerald-400/80">{item.id}</td>
                                    <td className="px-6 py-4 text-white font-medium">{item.project}</td>
                                    <td className="px-6 py-4">{item.vintage}</td>
                                    <td className="px-6 py-4">{item.amount}</td>
                                    <td className="px-6 py-4">{item.holder}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs border ${item.status === 'Issued' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                item.status === 'Retired' ? 'bg-white/5 text-white/40 border-white/10' :
                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {item.status}
                                        </span>
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

export default RegistryDashboard;
