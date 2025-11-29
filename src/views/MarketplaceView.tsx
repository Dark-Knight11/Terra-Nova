import React, { useState, useMemo, useEffect } from 'react';
import { Wind, Search, Loader2, RefreshCw } from 'lucide-react';
import MarketCard from '../components/MarketCard';
import { contractService, ProjectCategory } from '../services/contractService';

interface MarketplaceViewProps {
    handleProjectClick: (project: any) => void;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = ({ handleProjectClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedRegion, setSelectedRegion] = useState('All Regions');
    const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
    const [credits, setCredits] = useState<any[]>([]);
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);
    const [availableRegions, setAvailableRegions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalOnChainProjects, setTotalOnChainProjects] = useState<number>(0);

    // Fetch credits from backend and on-chain data
    useEffect(() => {
        fetchCredits();
    }, []);

    const fetchCredits = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch listings directly from chain
            if (contractService.isWalletAvailable()) {
                await contractService.connectWallet();
                const total = await contractService.getTotalProjects();
                setTotalOnChainProjects(total);

                const listings = await contractService.getAllListings();

                // Fetch project details for each listing
                const creditsWithDetails = await Promise.all(listings.map(async (listing) => {
                    const projectInfo = await contractService.getProjectInfo(listing.projectId);
                    if (!projectInfo) return null;

                    return {
                        id: listing.listingId,
                        projectId: listing.projectId,
                        title: projectInfo.projectName,
                        type: Object.keys(ProjectCategory)[projectInfo.category] || 'REFORESTATION', // Map category index to string
                        price: listing.currentPrice, // Already formatted as string in getAllListings -> getListing
                        amount: listing.amount,
                        location: projectInfo.country,
                        score: 95, // Mock score for now
                        company: {
                            name: projectInfo.projectDeveloper, // Use developer address as name for now
                            verificationStatus: 'VERIFIED'
                        },
                        image: 'https://images.unsplash.com/photo-1622383563227-044011dd8597?auto=format&fit=crop&q=80&w=1000', // Placeholder
                        description: `Vintage: ${projectInfo.vintageYear}`,
                        listing: listing
                    };
                }));

                const validCredits = creditsWithDetails.filter(Boolean);
                setCredits(validCredits);

                // Extract unique types and regions
                const types = Array.from(new Set(validCredits.map((c: any) => c.type))).filter(Boolean) as string[];
                const regions = Array.from(new Set(validCredits.map((c: any) => c.location))).filter(Boolean) as string[];

                setAvailableTypes(types);
                setAvailableRegions(regions);
            } else {
                throw new Error("Wallet not available");
            }

        } catch (err: any) {
            console.error('Failed to fetch credits from chain:', err);
            setError('Failed to load credits from blockchain. Please connect your wallet.');

            // Fallback to empty or mock if needed, but user requested chain data
            setCredits([]);
        } finally {
            setIsLoading(false);
        }
    };

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
            const companyName = typeof credit.company === 'string' ? credit.company : credit.company?.name || credit.companyName || '';
            const matchesSearch = (credit.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                companyName.toLowerCase().includes(searchQuery.toLowerCase());

            // Type Filter
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(credit.type);

            // Region Filter
            const matchesRegion = selectedRegion === 'All Regions' || credit.location?.includes(selectedRegion);

            // Price Filter
            const price = parseFloat(credit.price);
            const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
            const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
            const matchesPrice = price >= minPrice && price <= maxPrice;

            return matchesSearch && matchesType && matchesRegion && matchesPrice;
        });
    }, [searchQuery, selectedTypes, selectedRegion, priceRange, credits]);

    return (
        <div className="pt-32 px-6 pb-20 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-5xl mb-4">Global Marketplace</h1>
                            <p className="text-white/50 text-lg">Trade verified carbon credits directly on-chain.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {totalOnChainProjects > 0 && (
                                <div className="text-right">
                                    <div className="text-xs text-white/40 uppercase tracking-wider">On-Chain Projects</div>
                                    <div className="text-2xl font-serif text-emerald-400">{totalOnChainProjects}</div>
                                </div>
                            )}
                            <button
                                onClick={fetchCredits}
                                disabled={isLoading}
                                className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm">
                            {error}
                        </div>
                    )}
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
                                        {availableTypes.length > 0 ? (
                                            availableTypes.map((t, index) => (
                                                <label key={`${t}-${index}`} className="flex items-center gap-2 text-sm text-white/50 hover:text-white cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTypes.includes(t)}
                                                        onChange={() => toggleType(t)}
                                                        className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                                                    />
                                                    {t}
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-white/30 text-sm">No types available</p>
                                        )}
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
                                        {availableRegions.map((region, index) => (
                                            <option key={`${region}-${index}`} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-3 text-white/80">Price Range (USD)</h4>
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

                                {(selectedTypes.length > 0 || selectedRegion !== 'All Regions' || priceRange.min || priceRange.max) && (
                                    <button
                                        onClick={() => {
                                            setSelectedTypes([]);
                                            setSelectedRegion('All Regions');
                                            setPriceRange({ min: '', max: '' });
                                        }}
                                        className="w-full text-sm text-white/40 hover:text-white py-2 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Contract Info */}
                        <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <h4 className="text-sm font-medium mb-4 text-white/80">Contract Info</h4>
                            <div className="space-y-3 text-xs">
                                <div>
                                    <div className="text-white/40 mb-1">Network</div>
                                    <div className="text-emerald-400 font-mono">Sepolia Testnet</div>
                                </div>
                                <div>
                                    <div className="text-white/40 mb-1">Token Contract</div>
                                    <div className="text-white/60 font-mono truncate" title={contractService.getContractAddresses().token}>
                                        {contractService.getContractAddresses().token.slice(0, 10)}...
                                    </div>
                                </div>
                                <div>
                                    <div className="text-white/40 mb-1">Marketplace</div>
                                    <div className="text-white/60 font-mono truncate" title={contractService.getContractAddresses().marketplace}>
                                        {contractService.getContractAddresses().marketplace.slice(0, 10)}...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="text-sm text-white/50">
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin" /> Loading...
                                    </span>
                                ) : (
                                    <>Showing <span className="text-white">{filteredCredits.length}</span> active listings</>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or company..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-black/20 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-white/30 w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
                                        <div className="h-40 bg-white/10 rounded mb-4"></div>
                                        <div className="h-4 bg-white/10 rounded mb-2"></div>
                                        <div className="h-3 bg-white/10 rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCredits.length > 0 ? (
                                    filteredCredits.map((credit) => (
                                        <MarketCard key={credit.id} credit={credit} onClick={() => handleProjectClick(credit)} />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-20">
                                        <div className="text-white/30 mb-4">No projects found matching your criteria.</div>
                                        <button
                                            onClick={() => {
                                                setSelectedTypes([]);
                                                setSelectedRegion('All Regions');
                                                setPriceRange({ min: '', max: '' });
                                                setSearchQuery('');
                                            }}
                                            className="text-emerald-400 hover:text-emerald-300 text-sm"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceView;
