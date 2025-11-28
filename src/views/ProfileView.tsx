import { useState } from 'react';
import { User, Clock, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

const ProfileView = () => {
    const { user, linkWallet } = useAuth();
    const [isLinking, setIsLinking] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);

    const maskAddress = (address: string) => {
        if (!address || address.length < 10) return address;
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleConnectWallet = async () => {
        setLinkError(null);
        setIsLinking(true);
        try {
            if (!(window as any).ethereum) {
                throw new Error('MetaMask not detected. Please install MetaMask extension.');
            }
            const accounts: string[] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];
            const { message: siweMessage } = await api.auth.getNonce(address);
            const signature = await (window as any).ethereum.request({
                method: 'personal_sign',
                params: [siweMessage, address]
            });
            await linkWallet(address, signature, siweMessage);
        } catch (err: any) {
            setLinkError(err.message || 'Failed to connect wallet.');
        } finally {
            setIsLinking(false);
        }
    };

    if (!user) return <div className="pt-32 px-6 text-center">Please login to view profile.</div>;

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'COMPANY':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'AUDITOR':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'REGISTRY':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default:
                return 'bg-white/10 text-white/60 border-white/20';
        }
    };

    return (
        <div className="pt-32 px-6 pb-20 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-3xl font-serif">
                        {user.email ? user.email.charAt(0).toUpperCase() : <User size={32} />}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                            <h1 className="text-3xl font-serif">
                                {user.company?.name || user.email?.split('@')[0] || 'Anonymous User'}
                            </h1>
                            <span className={`px-3 py-1 rounded text-xs uppercase tracking-widest border ${getRoleBadgeColor(user.role)}`}>
                                {user.role}
                            </span>
                            {user.isVerified && (
                                <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                                    <span className="font-serif text-emerald-400">Verified</span>
                                </div>
                            )}
                        </div>
                        {/* Wallet Section */}
                        {user.walletAddress ? (
                            <p className="text-sm text-white/80">
                                Wallet: <span className="font-mono text-emerald-400">{maskAddress(user.walletAddress)}</span>
                            </p>
                        ) : (
                            <div className="mt-4">
                                {linkError && <p className="text-red-400 text-xs mb-2">{linkError}</p>}
                                <button
                                    onClick={handleConnectWallet}
                                    disabled={isLinking}
                                    className="w-full bg-white/5 text-white border border-white/10 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Wallet size={18} />
                                    {isLinking ? 'Connecting...' : 'Connect MetaMask'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {/* Recent Activity */}
                <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-2xl p-8">
                    <h3 className="text-lg font-serif mb-6 flex items-center gap-2">
                        <Clock size={18} className="text-white/40" /> Recent Activity
                    </h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4 items-start group">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 group-hover:scale-125 transition-transform" />
                                <div>
                                    <p className="text-sm text-white/80">Logged in successfully via {user.email ? 'Email' : 'Wallet'}</p>
                                    <p className="text-xs text-white/30 mt-1">Today, {new Date().toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
