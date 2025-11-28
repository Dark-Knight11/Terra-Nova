import React from 'react';
import { TrendingUp, Package, Clock } from 'lucide-react';

const CompanyDashboard: React.FC = () => {
    // Mock Data
    const stats = [
        { label: 'Total Credits Listed', value: '150,000', unit: 'tCO2e', icon: Package, change: '+12%' },
        { label: 'Credits Sold', value: '85,000', unit: 'tCO2e', icon: TrendingUp, change: '+5%' },
        { label: 'Pending Verification', value: '25,000', unit: 'tCO2e', icon: Clock, change: '-2%' },
    ];

    const listings = [
        { id: 1, name: 'Amazon Rainforest Conservation', type: 'Forestry', amount: '50,000', status: 'Active', price: '$15.00' },
        { id: 2, name: 'Solar Farm Project Alpha', type: 'Renewable Energy', amount: '35,000', status: 'Sold Out', price: '$12.50' },
        { id: 3, name: 'Mangrove Restoration Initiative', type: 'Blue Carbon', amount: '25,000', status: 'Pending', price: '$18.00' },
        { id: 4, name: 'Wind Power Expansion', type: 'Renewable Energy', amount: '40,000', status: 'Active', price: '$11.00' },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 hover:border-emerald-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <stat.icon size={20} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-3xl font-serif text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-white/40">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Listings Table */}
            <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-serif text-white">My Listings</h3>
                    <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/60">
                        <thead className="bg-white/5 text-white/40 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Project Name</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Amount (tCO2e)</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {listings.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                                    <td className="px-6 py-4">{item.type}</td>
                                    <td className="px-6 py-4">{item.amount}</td>
                                    <td className="px-6 py-4">{item.price}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs border ${item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            item.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-white/5 text-white/40 border-white/10'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-white/40 hover:text-white transition-colors">Manage</button>
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

export default CompanyDashboard;
