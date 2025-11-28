import React, { useState } from 'react';
import { Mail, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

interface AuthModalProps {
    showAuth: boolean;
    setShowAuth: (show: boolean) => void;
    authType: 'login' | 'signup';
    setAuthType: (type: 'login' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ showAuth, setShowAuth, authType, setAuthType }) => {
    const { login, register, loginWithWallet } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'COMPANY',
        companyName: ''
    });
    const [showWalletConnect, setShowWalletConnect] = useState(false); // New state for showing wallet connect button

    const connectWallet = async () => {
        setError(null);
        setIsLoading(true);
        try {
            if (!(window as any).ethereum) {
                throw new Error('MetaMask not detected. Please install MetaMask extension.');
            }
            // Request permissions to force account selection
            await (window as any).ethereum.request({
                method: 'wallet_requestPermissions',
                params: [{ eth_accounts: {} }]
            });
            const accounts: string[] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];
            const { message: siweMessage } = await api.auth.getNonce(address);
            const signature = await (window as any).ethereum.request({
                method: 'personal_sign',
                params: [siweMessage, address]
            });
            await loginWithWallet(address, signature, siweMessage);
            setShowAuth(false);
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (authType === 'login') {
                await login(formData.email, formData.password);
                setShowAuth(false); // Close modal after successful login
            } else {
                // @ts-ignore - companyName is optional in state but required for API if role is COMPANY
                await register(formData.email, formData.password, formData.role, formData.companyName);
                // After successful signup, show wallet connect option
                setShowWalletConnect(true);
            }
            setFormData({ email: '', password: '', role: 'COMPANY', companyName: '' });
        } catch (err: any) {
            if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
                setError(err.errors[0].message);
            } else {
                setError(err.message || 'Authentication failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!showAuth) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAuth(false)}></div>
            <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent blur-md"></div>

                <h2 className="font-serif text-3xl text-white mb-2">
                    {authType === 'login' ? 'Welcome Back' : 'Join the Registry'}
                </h2>
                <p className="text-white/40 text-sm mb-6">Secure access to the global carbon ledger.</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-white/40 flex items-center gap-2">
                            <Mail size={12} />
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="user@company.com"
                            required
                            disabled={isLoading || showWalletConnect}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-white/40">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="••••••••"
                            required
                            disabled={isLoading || showWalletConnect}
                            minLength={8}
                        />
                        <p className="text-[10px] text-white/30">
                            Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number.
                        </p>
                    </div>

                    {authType === 'signup' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-white/40">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    disabled={isLoading || showWalletConnect}
                                >
                                    <option value="COMPANY">Company</option>
                                    <option value="AUDITOR">Auditor</option>
                                    <option value="REGISTRY">Registry</option>
                                </select>
                            </div>

                            {formData.role === 'COMPANY' && (
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider text-white/40">Company Name</label>
                                    <input
                                        type="text"
                                        // @ts-ignore
                                        value={formData.companyName || ''}
                                        // @ts-ignore
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="Acme Corp"
                                        required={formData.role === 'COMPANY'}
                                        disabled={isLoading || showWalletConnect}
                                        minLength={2}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || showWalletConnect}
                        className="w-full bg-white text-black py-3 rounded-lg font-medium mt-4 hover:bg-emerald-400 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : authType === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                    {showWalletConnect && (
                        <button
                            onClick={connectWallet}
                            disabled={isLoading}
                            className="w-full bg-white/5 text-white border border-white/10 py-3 rounded-lg font-medium flex items-center justify-center gap-2 mt-4 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Wallet size={18} />
                            {isLoading ? 'Connecting...' : 'Connect MetaMask'}
                        </button>
                    )}
                </form>



                <p
                    className="text-center text-white/40 text-xs mt-4 cursor-pointer hover:text-emerald-400 transition-colors"
                    onClick={() => setAuthType(authType === 'login' ? 'signup' : 'login')}
                >
                    {authType === 'login' ? "Don't have an account? Sign up" : 'Already verified? Login'}
                </p>
            </div>
        </div >
    );
};

export default AuthModal;
