import React, { useEffect, useState } from 'react';
import { contractService, AuctionType, AuctionStatus, type Listing } from '../services/contractService';
import { Loader2, TrendingUp, DollarSign, Activity, Clock, Gavel, Tag, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Trade {
    price: string;
    amount: string;
    timestamp: string;
}

interface TradingViewProps {
    projectId: string;
    onBack: () => void;
}

const TradingView: React.FC<TradingViewProps> = ({ projectId, onBack }) => {
    const { user } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState<'buy' | 'sell'>('buy');
    const [listingType, setListingType] = useState<'fixed' | 'english' | 'dutch'>('fixed');
    const [price, setPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [reservePrice, setReservePrice] = useState('');
    const [duration, setDuration] = useState('24'); // hours
    const [submitting, setSubmitting] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [userBalance, setUserBalance] = useState<string>('0');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        checkWalletAndFetchData();
    }, [projectId]);

    const checkWalletAndFetchData = async () => {
        try {
            if (contractService.isWalletAvailable()) {
                const address = await contractService.connectWallet();
                setWalletConnected(true);
                setWalletAddress(address);

                // Get user's balance for this project
                const balance = await contractService.getTokenBalance(projectId);
                setUserBalance(balance);
            }
        } catch (err) {
            console.error('Wallet connection failed:', err);
        }

        await fetchMarketData();
    };

    const fetchMarketData = async () => {
        if (!projectId) return;
        setLoading(true);

        try {
            // Fetch from backend API
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/market/${projectId}`);
            if (response.ok) {
                const data = await response.json();
                setListings(data.data?.listings || []);
                setTrades(data.data?.trades || []);
            } else {
                // If API fails, we might not have listings yet - that's okay
                setListings([]);
                setTrades([]);
            }
        } catch (err) {
            console.error('Failed to fetch market data', err);
            setListings([]);
            setTrades([]);
        } finally {
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        try {
            setError(null);
            const address = await contractService.connectWallet();
            setWalletConnected(true);
            setWalletAddress(address);
            const balance = await contractService.getTokenBalance(projectId);
            setUserBalance(balance);
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet');
        }
    };

    const handleCreateListing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !walletConnected) return;

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            let result;
            const durationSeconds = parseInt(duration) * 3600; // Convert hours to seconds

            if (listingType === 'fixed') {
                result = await contractService.createFixedPriceListing(projectId, amount, price);
                setSuccess(`Fixed price listing created! Listing ID: ${result.listingId}`);
            } else if (listingType === 'english') {
                result = await contractService.createEnglishAuction(
                    projectId,
                    amount,
                    price, // starting price
                    reservePrice || price, // reserve price
                    durationSeconds
                );
                setSuccess(`English auction created! Listing ID: ${result.listingId}`);
            } else if (listingType === 'dutch') {
                const priceDecrement = (parseFloat(price) - parseFloat(reservePrice)) / (durationSeconds / 300); // Decrement every 5 mins
                result = await contractService.createDutchAuction(
                    projectId,
                    amount,
                    price,
                    reservePrice,
                    priceDecrement.toFixed(6),
                    300, // 5 minute intervals
                    durationSeconds
                );
                setSuccess(`Dutch auction created! Listing ID: ${result.listingId}`);
            }

            // Refresh data
            await fetchMarketData();
            const balance = await contractService.getTokenBalance(projectId);
            setUserBalance(balance);

            // Reset form
            setPrice('');
            setAmount('');
            setReservePrice('');
        } catch (err: any) {
            console.error('Create listing failed', err);
            setError(err.message || 'Failed to create listing');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBuyListing = async (listing: Listing) => {
        if (!walletConnected) {
            await connectWallet();
            return;
        }

        const confirmMsg = listing.auctionType === AuctionType.FixedPrice
            ? `Buy ${listing.amount} credits for ${listing.currentPrice} ETH?`
            : listing.auctionType === AuctionType.Dutch
                ? `Buy at current Dutch auction price?`
                : `Place a bid on this auction?`;

        if (!confirm(confirmMsg)) return;

        setSubmitting(true);
        setError(null);

        try {
            if (listing.auctionType === AuctionType.FixedPrice) {
                await contractService.buyFixedPrice(listing.listingId, listing.currentPrice);
                setSuccess('Purchase successful!');
            } else if (listing.auctionType === AuctionType.Dutch) {
                await contractService.buyDutchAuction(listing.listingId);
                setSuccess('Dutch auction purchase successful!');
            }

            await fetchMarketData();
        } catch (err: any) {
            console.error('Buy failed', err);
            setError(err.message || 'Purchase failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePlaceBid = async (listing: Listing, bidAmount: string) => {
        if (!walletConnected) {
            await connectWallet();
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await contractService.placeBid(listing.listingId, bidAmount);
            setSuccess('Bid placed successfully!');
            await fetchMarketData();
        } catch (err: any) {
            console.error('Bid failed', err);
            setError(err.message || 'Bid failed');
        } finally {
            setSubmitting(false);
        }
    };

    const getAuctionTypeLabel = (type: number) => {
        switch (type) {
            case AuctionType.English: return 'English Auction';
            case AuctionType.Dutch: return 'Dutch Auction';
            case AuctionType.FixedPrice: return 'Fixed Price';
            default: return 'Unknown';
        }
    };

    const getStatusLabel = (status: number) => {
        switch (status) {
            case AuctionStatus.Active: return 'Active';
            case AuctionStatus.Completed: return 'Completed';
            case AuctionStatus.Cancelled: return 'Cancelled';
            default: return 'Unknown';
        }
    };

    const formatTimeRemaining = (endTime: number) => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = endTime - now;
        if (remaining <= 0) return 'Ended';

        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);

        if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin w-10 h-10 text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pt-24 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 mb-8">
                    <div>
                        <button onClick={onBack} className="text-white/40 hover:text-white text-sm mb-2 flex items-center gap-1 transition-colors">
                            ← Back to Project
                        </button>
                        <h1 className="text-3xl font-serif text-white">Trade Project #{projectId}</h1>
                        <p className="text-white/50 text-sm mt-1">Carbon Credit / ETH Trading</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-4">
                        {walletConnected ? (
                            <div className="text-right">
                                <div className="text-xs text-white/40">Connected Wallet</div>
                                <div className="font-mono text-sm text-emerald-400">
                                    {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                                </div>
                                <div className="text-xs text-white/60 mt-1">
                                    Balance: <span className="text-white">{userBalance}</span> credits
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={connectWallet}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg transition-colors"
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400">×</button>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400">
                        <Activity size={20} />
                        <span>{success}</span>
                        <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-400/60 hover:text-emerald-400">×</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Order Book */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Market Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-4">
                                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Active Listings</div>
                                <div className="text-2xl font-serif">{listings.filter(l => l.status === AuctionStatus.Active).length}</div>
                            </div>
                            <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-4">
                                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Last Price</div>
                                <div className="text-2xl font-serif text-emerald-400">
                                    {trades.length > 0 ? `${(Number(trades[0].price) / 1e18).toFixed(4)} ETH` : '---'}
                                </div>
                            </div>
                            <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-4">
                                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Trades</div>
                                <div className="text-2xl font-serif">{trades.length}</div>
                            </div>
                        </div>

                        {/* Active Listings */}
                        <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-white/10">
                                <h3 className="text-lg font-serif flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-emerald-400" />
                                    Active Listings
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 text-white/40 uppercase tracking-wider text-xs">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Type</th>
                                            <th className="px-6 py-4 font-medium">Seller</th>
                                            <th className="px-6 py-4 font-medium text-right">Amount</th>
                                            <th className="px-6 py-4 font-medium text-right">Price (ETH)</th>
                                            <th className="px-6 py-4 font-medium text-right">Time Left</th>
                                            <th className="px-6 py-4 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {listings.filter(l => l.status === AuctionStatus.Active).map((listing) => (
                                            <tr key={listing.listingId} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs border ${listing.auctionType === AuctionType.FixedPrice
                                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        : listing.auctionType === AuctionType.English
                                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                        }`}>
                                                        {listing.auctionType === AuctionType.FixedPrice && <Tag size={12} className="inline mr-1" />}
                                                        {listing.auctionType === AuctionType.English && <Gavel size={12} className="inline mr-1" />}
                                                        {listing.auctionType === AuctionType.Dutch && <TrendingUp size={12} className="inline mr-1" />}
                                                        {getAuctionTypeLabel(listing.auctionType)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-white/60">
                                                    {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-white">{listing.amount}</td>
                                                <td className="px-6 py-4 text-right text-emerald-400 font-medium">
                                                    {listing.currentPrice}
                                                </td>
                                                <td className="px-6 py-4 text-right text-white/60">
                                                    <span className="flex items-center justify-end gap-1">
                                                        <Clock size={12} />
                                                        {formatTimeRemaining(listing.endTime)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleBuyListing(listing)}
                                                        disabled={submitting || listing.seller.toLowerCase() === walletAddress?.toLowerCase()}
                                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {listing.auctionType === AuctionType.FixedPrice ? 'Buy' :
                                                            listing.auctionType === AuctionType.Dutch ? 'Buy Now' : 'Bid'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {listings.filter(l => l.status === AuctionStatus.Active).length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                                                    No active listings for this project. Be the first to create one!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Trades */}
                        {trades.length > 0 && (
                            <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-white/10">
                                    <h3 className="text-lg font-serif flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-emerald-400" />
                                        Recent Trades
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-2">
                                        {trades.slice(0, 10).map((trade, i) => (
                                            <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                                <span className="text-white/60">{trade.amount} credits</span>
                                                <span className="text-emerald-400 font-mono">{(Number(trade.price) / 1e18).toFixed(4)} ETH</span>
                                                <span className="text-white/40 text-xs">{new Date(trade.timestamp).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Create Listing Form */}
                    <div className="space-y-6">
                        <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 sticky top-24">
                            <h3 className="text-lg font-serif mb-6">Create Listing</h3>

                            {!walletConnected ? (
                                <div className="text-center py-8">
                                    <p className="text-white/50 mb-4">Connect your wallet to create listings</p>
                                    <button
                                        onClick={connectWallet}
                                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg transition-colors"
                                    >
                                        Connect Wallet
                                    </button>
                                </div>
                            ) : parseInt(userBalance) === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-white/50">You don't have any credits for this project to list.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateListing} className="space-y-4">
                                    {/* Listing Type Selector */}
                                    <div>
                                        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Listing Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['fixed', 'english', 'dutch'] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setListingType(type)}
                                                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${listingType === type
                                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                                                        }`}
                                                >
                                                    {type === 'fixed' && <Tag size={12} className="inline mr-1" />}
                                                    {type === 'english' && <Gavel size={12} className="inline mr-1" />}
                                                    {type === 'dutch' && <TrendingUp size={12} className="inline mr-1" />}
                                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                                            Amount <span className="text-white/20">(Available: {userBalance})</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            max={userBalance}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            placeholder="0"
                                            required
                                        />
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                                            {listingType === 'fixed' ? 'Price per Credit (ETH)' : 'Starting Price (ETH)'}
                                        </label>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            step="0.0001"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>

                                    {/* Reserve Price (for auctions) */}
                                    {listingType !== 'fixed' && (
                                        <div>
                                            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                                                Reserve Price (ETH)
                                            </label>
                                            <input
                                                type="number"
                                                value={reservePrice}
                                                onChange={(e) => setReservePrice(e.target.value)}
                                                step="0.0001"
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    )}

                                    {/* Duration (for auctions) */}
                                    {listingType !== 'fixed' && (
                                        <div>
                                            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                                                Duration (Hours)
                                            </label>
                                            <select
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            >
                                                <option value="1">1 Hour</option>
                                                <option value="6">6 Hours</option>
                                                <option value="12">12 Hours</option>
                                                <option value="24">24 Hours</option>
                                                <option value="48">48 Hours</option>
                                                <option value="168">7 Days</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Total Preview */}
                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex justify-between text-sm text-white/60 mb-2">
                                            <span>Total Value</span>
                                            <span className="text-white font-mono">
                                                {(Number(amount) * Number(price)).toFixed(4)} ETH
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-white/40">
                                            <span>Platform Fee (2.5%)</span>
                                            <span>{(Number(amount) * Number(price) * 0.025).toFixed(6)} ETH</span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || !amount || !price}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {submitting && <Loader2 className="animate-spin w-4 h-4" />}
                                        Create {listingType === 'fixed' ? 'Listing' : 'Auction'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradingView;
