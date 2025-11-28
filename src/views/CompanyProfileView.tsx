import React from 'react';
import { Shield, MapPin, Globe, Mail } from 'lucide-react';

interface CompanyProfileViewProps {
    company: any;
    onBack: () => void;
}

const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({ company, onBack }) => {
    if (!company) return <div className="pt-32 px-6 text-center">Loading...</div>;

    const companyName = typeof company === 'string' ? company : company.name;
    const isVerified = typeof company === 'object' && company.verificationStatus === 'VERIFIED';

    // Generate deterministic stats based on company name
    const getStats = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash) + name.charCodeAt(i);
            hash = hash & hash;
        }
        const seed = Math.abs(hash);

        return {
            totalRetired: Math.floor((seed % 1000) / 10 + 0.5) / 10 + 'M',
            activeProjects: Math.floor((seed % 50) + 5),
            trustScore: Math.floor((seed % 15) + 85)
        };
    };

    const stats = getStats(companyName);

    return (
        <div className="pt-32 px-6 pb-20 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <button onClick={onBack} className="text-white/40 hover:text-white mb-8 text-sm uppercase tracking-widest">
                    &larr; Back
                </button>

                {/* Header */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-3xl font-serif">
                        {companyName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                            <h1 className="text-3xl font-serif">{companyName}</h1>
                            <span className="px-3 py-1 rounded text-xs uppercase tracking-widest border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                Company
                            </span>
                            {isVerified && (
                                <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                                    <Shield size={12} />
                                    <span className="font-serif">Verified Issuer</span>
                                </div>
                            )}
                        </div>
                        <p className="text-white/60 max-w-2xl">
                            Leading developer of carbon offset projects committed to sustainability and transparency.
                        </p>

                        <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                            <div className="flex items-center gap-2 text-sm text-white/40">
                                <MapPin size={14} /> Global
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/40">
                                <Globe size={14} /> {companyName.toLowerCase().replace(/\s+/g, '')}.com
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/40">
                                <Mail size={14} /> contact@{companyName.toLowerCase().replace(/\s+/g, '')}.com
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6">
                        <div className="text-sm text-white/40 uppercase tracking-widest mb-1">Total Retired</div>
                        <div className="text-3xl font-serif">{stats.totalRetired} <span className="text-sm text-white/30">tCO2e</span></div>
                    </div>
                    <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6">
                        <div className="text-sm text-white/40 uppercase tracking-widest mb-1">Active Projects</div>
                        <div className="text-3xl font-serif">{stats.activeProjects}</div>
                    </div>
                    <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6">
                        <div className="text-sm text-white/40 uppercase tracking-widest mb-1">Trust Score</div>
                        <div className="text-3xl font-serif text-emerald-400">{stats.trustScore}/100</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfileView;
