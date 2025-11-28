import React, { useEffect, useState, useRef } from 'react';
import { contractService } from '../services/contractService';
import { Loader2, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface Listing {
    listingId: string;
    seller: string;
    amount: string;
    price: string;
    status: string;
}

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
    const [listings, setListings] = useState<Listing[]>([]);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState<'buy' | 'sell'>('buy');
    const [price, setPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMarketData();
        const interval = setInterval(fetchMarketData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [projectId]);

    const fetchMarketData = async () => {
        if (!projectId) return;
        try {
            const response = await fetch(`http://localhost:3001/api/market/${projectId}`);
            const data = await response.json();
            setListings(data.listings);
            setTrades(data.trades);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch market data', error);
            setLoading(false);
        }
    };

    const handleTrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;
        setSubmitting(true);

        try {
            if (action === 'sell') {
                await contractService.createFixedPriceListing(projectId, amount, price);
            } else {
                // For buying, we need to select a listing. 
                // This simple form assumes we are creating a buy order, but our contract only supports filling listings.
                // So for 'buy', we should probably guide user to click the order book.
                // However, if we want to "Buy" specific amount, we'd need to match against listings.
                // For this MVP, let's make the "Buy" tab just a filter or instruction, 
                // OR we implement a "Quick Buy" that picks the cheapest listing.
                alert("To buy, please select a listing from the Order Book.");
            }
            await fetchMarketData();
        } catch (error) {
            console.error('Trade failed', error);
            alert('Trade failed: ' + (error as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleBuyListing = async (listing: Listing) => {
        if (!confirm(`Buy ${listing.amount} credits for ${listing.price} ETH?`)) return;
        setSubmitting(true);
        try {
            // Convert wei to eth for display/input if needed, but contractService expects ETH string
            // Wait, listing.price is in Wei from backend. contractService.buyFixedPrice expects ETH string?
            // Let's check contractService. It uses parseEther(priceEth).
            // So we need to convert Wei to Eth.
            const priceEth = (Number(listing.price) / 1e18).toString();
            await contractService.buyFixedPrice(listing.listingId, priceEth);
            await fetchMarketData();
        } catch (error) {
            console.error('Buy failed', error);
            alert('Buy failed: ' + (error as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-10 h-10 text-blue-500" /></div>;

    return (
        <div className="min-h-screen bg-black text-white p-6 pt-24 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Column: Chart & Stats */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-end border-b border-gray-800 pb-4">
                        <div>
                            <button onClick={onBack} className="text-gray-500 hover:text-white text-sm mb-2 flex items-center gap-1">
                                ← Back to Project
                            </button>
                            <h1 className="text-3xl font-light text-gray-100">Project #{projectId}</h1>
                            <p className="text-gray-400 text-sm mt-1">Carbon Credit / ETH</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-medium text-green-400 flex items-center justify-end gap-2">
                                {trades.length > 0 ? (Number(trades[0].price) / 1e18).toFixed(4) : '---'} ETH
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <p className="text-gray-500 text-xs">Last Traded Price</p>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 h-96 p-4 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        {trades.length > 0 ? (
                            <SimpleChart trades={trades} />
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center">
                                <Activity className="w-12 h-12 mb-2 opacity-50" />
                                <p>No trade history available</p>
                            </div>
                        )}
                    </div>

                    {/* Order Book (Asks) */}
                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-blue-400" /> Order Book (Asks)
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-gray-500 border-b border-gray-800">
                                    <tr>
                                        <th className="pb-3 font-normal">Seller</th>
                                        <th className="pb-3 font-normal text-right">Amount</th>
                                        <th className="pb-3 font-normal text-right">Price (ETH)</th>
                                        <th className="pb-3 font-normal text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {listings.map((listing) => (
                                        <tr key={listing.listingId} className="group hover:bg-gray-800/30 transition-colors">
                                            <td className="py-3 font-mono text-gray-400">
                                                {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                                            </td>
                                            <td className="py-3 text-right">{listing.amount}</td>
                                            <td className="py-3 text-right text-green-400 font-medium">
                                                {(Number(listing.price) / 1e18).toFixed(4)}
                                            </td>
                                            <td className="py-3 text-right">
                                                <button
                                                    onClick={() => handleBuyListing(listing)}
                                                    disabled={submitting}
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors disabled:opacity-50"
                                                >
                                                    Buy
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {listings.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">
                                                No active listings
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Trade Form */}
                <div className="space-y-6">
                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 sticky top-24">
                        <div className="flex bg-gray-800/50 rounded-lg p-1 mb-6">
                            <button
                                onClick={() => setAction('buy')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${action === 'buy' ? 'bg-green-500/20 text-green-400 shadow-sm' : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => setAction('sell')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${action === 'sell' ? 'bg-red-500/20 text-red-400 shadow-sm' : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                Sell
                            </button>
                        </div>

                        <form onSubmit={handleTrade} className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Amount</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="0.00"
                                        required={action === 'sell'}
                                        disabled={action === 'buy'} // Disable for buy as we use order book
                                    />
                                    <span className="absolute right-4 top-3 text-gray-500 text-sm">Credits</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Price per Credit</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="0.00"
                                        step="0.0001"
                                        required={action === 'sell'}
                                        disabled={action === 'buy'}
                                    />
                                    <span className="absolute right-4 top-3 text-gray-500 text-sm">ETH</span>
                                </div>
                            </div>

                            {action === 'buy' && (
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
                                    To purchase credits, please select a listing from the Order Book on the left.
                                </div>
                            )}

                            {action === 'sell' && (
                                <div className="pt-2">
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>Total</span>
                                        <span>{(Number(amount) * Number(price)).toFixed(4)} ETH</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {submitting && <Loader2 className="animate-spin w-4 h-4" />}
                                        Create Sell Order
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple SVG Chart Component
const SimpleChart = ({ trades }: { trades: Trade[] }) => {
    // Basic visualization logic
    const prices = trades.map(t => Number(t.price) / 1e18);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    // Normalize points to 0-100 height
    const points = prices.map((p, i) => {
        const x = (i / (prices.length - 1)) * 100;
        const y = 100 - ((p - min) / range) * 80 - 10; // 10% padding
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full flex items-end">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={`M0,100 ${points} L100,100 Z`}
                    fill="url(#chartGradient)"
                />
                <polyline
                    points={points}
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="0.5"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    );
};

export default TradingView;
