import React, { useState } from 'react';
import { X, Loader2, Tag, Coins } from 'lucide-react';
import { contractService } from '../../services/contractService';

interface CreateListingModalProps {
    projectId: string;
    maxAmount: number;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateListingModal: React.FC<CreateListingModalProps> = ({ projectId, maxAmount, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (parseFloat(amount) > maxAmount) {
                throw new Error(`You only have ${maxAmount} credits available.`);
            }

            await contractService.createFixedPriceListing(projectId, amount, price);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Failed to create listing:', err);
            setError(err.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-md w-full">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-serif text-white">List Credits for Sale</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Amount to Sell</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                placeholder="0"
                                min="1"
                                max={maxAmount}
                                required
                            />
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        </div>
                        <div className="mt-1 text-xs text-white/40 text-right">
                            Available: {maxAmount} credits
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Price per Credit (ETH)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                placeholder="0.00"
                                step="0.000001"
                                required
                            />
                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-medium py-3 rounded-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : null}
                            {loading ? 'Confirming Transaction...' : 'Create Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateListingModal;
