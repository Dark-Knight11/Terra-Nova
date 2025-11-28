import React, { useState, useMemo } from 'react';
import { Wind, Search } from 'lucide-react';
import MarketCard from '../components/MarketCard';
import { credits } from '../data/mockData';

interface MarketplaceViewProps {
    handleProjectClick: (project: any) => void;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = ({ handleProjectClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedRegion, setSelectedRegion] = useState('All Regions');
    const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const filteredCredits = useMemo(() => {
        return credits.filter(credit => {
            // Search Filter
            const matchesSearch = credit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                credit.company.toLowerCase().includes(searchQuery.toLowerCase());

            // Type Filter
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(credit.type);

            // Region Filter
            const matchesRegion = selectedRegion === 'All Regions' || credit.location.includes(selectedRegion);

            // Price Filter
            const price = parseFloat(credit.price);
            const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
            const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
            const matchesPrice = price >= minPrice && price <= maxPrice;

            return matchesSearch && matchesType && matchesRegion && matchesPrice;
        });
    }, [searchQuery, selectedTypes, selectedRegion, priceRange]);

    return (
        <div className="pt-32 px-6 pb-20 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="font-serif text-5xl mb-4">Global Marketplace</h1>
                    <p className="text-white/50 text-lg">Trade verified carbon credits directly on-chain.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-6 text-emerald-400">
                                <Wind size={18} /> <span className="uppercase tracking-widest text-xs font-bold">Filters</span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium mb-3 text-white/80">Project Type</h4>
                                    <div className="space-y-2">
                                        {['Reforestation', 'Renewable Energy', 'Blue Carbon', 'Methane Capture'].map(t => (
                                            <label key={t} className="flex items-center gap-2 text-sm text-white/50 hover:text-white cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTypes.includes(t)}
                                                    onChange={() => toggleType(t)}
                                                    className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                                                />
                                                {t}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-3 text-white/80">Location</h4>
                                    <select
                                        value={selectedRegion}
                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white/70 focus:outline-none"
                                    >
                                        <option>All Regions</option>
                                        <option>South America</option>
                                        <option>Africa</option>
                                        <option>Asia Pacific</option>
                                        <option>Europe</option>
                                    </select>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-3 text-white/80">Price Range</h4>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
                                        />
                                        <span className="text-white/30">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="text-sm text-white/50">Showing <span className="text-white">{filteredCredits.length}</span> active listings</div>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-black/20 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-white/30 w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCredits.length > 0 ? (
                                filteredCredits.map((credit) => (
                                    <MarketCard key={credit.id} credit={credit} onClick={() => handleProjectClick(credit)} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-white/30">
                                    No projects found matching your criteria.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceView;
