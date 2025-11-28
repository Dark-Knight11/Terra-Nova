import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

interface AuthModalProps {
    showAuth: boolean;
    setShowAuth: (show: boolean) => void;
    authType: string;
    setAuthType: (type: string) => void;
}

declare global {
    interface Window {
        ethereum?: any;
    }
}

const AuthModal: React.FC<AuthModalProps> = ({ showAuth, setShowAuth, authType, setAuthType }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connectWallet = async () => {
        setIsConnecting(true);
        setError(null);

        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
                console.log('Connected account:', account);
                alert(`Connected: ${account}`);
                setShowAuth(false);
            } catch (err: any) {
                console.error('User denied account access', err);
                setError('Connection failed. Please try again.');
            } finally {
                setIsConnecting(false);
            }
        } else {
            console.error('Metamask not detected');
            setError('Metamask not detected. Please install it.');
            setIsConnecting(false);
        }
    };

    if (!showAuth) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAuth(false)}></div>
            <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent blur-md"></div>
                <h2 className="font-serif text-3xl text-white mb-2">{authType === 'login' ? 'Welcome Back' : 'Join the Registry'}</h2>
                <p className="text-white/40 text-sm mb-6">Secure access to the global carbon ledger.</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-white/40">Email</label>
                        <input type="email" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="user@company.com" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-white/40">Password</label>
                        <input type="password" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="••••••••" />
                    </div>
                    <button className="w-full bg-white text-black py-3 rounded-lg font-medium mt-4 hover:bg-emerald-400 hover:scale-[1.02] transition-all duration-300">
                        {authType === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0a0a0a] px-2 text-white/30">Or continue with</span></div>
                    </div>
                    <button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="w-full bg-white/5 text-white border border-white/10 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Wallet size={18} />
                        {isConnecting ? 'Connecting...' : 'Metamask'}
                    </button>
                    <p className="text-center text-white/40 text-xs mt-4 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => setAuthType(authType === 'login' ? 'signup' : 'login')}>
                        {authType === 'login' ? "Don't have an account? Sign up" : "Already verified? Login"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
