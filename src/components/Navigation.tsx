import React from 'react';
import { Leaf, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
    scrolled: boolean;
    setAuthType: (type: 'login' | 'signup') => void;
    setShowAuth: (show: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({
    activeTab,
    setActiveTab,
    isMenuOpen,
    setIsMenuOpen,
    scrolled,
    setAuthType,
    setShowAuth
}) => {
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-lg border-b border-white/5 py-4' : 'py-8'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <button
                    onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }}
                    className="text-2xl font-serif text-white tracking-wider flex items-center gap-2 hover:opacity-80 transition-opacity z-50 relative"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center">
                        <Leaf size={16} className="text-white" />
                    </div>
                    Carbon Block
                </button>

                <div className="hidden md:flex items-center gap-8">
                    <button
                        onClick={() => setActiveTab('marketplace')}
                        className={`text-sm uppercase tracking-widest transition-colors ${activeTab === 'marketplace' ? 'text-white font-medium' : 'text-white/60 hover:text-white'}`}
                    >
                        Marketplace
                    </button>
                    <button
                        onClick={() => setActiveTab('technology')}
                        className={`text-sm uppercase tracking-widest transition-colors ${activeTab === 'technology' ? 'text-white font-medium' : 'text-white/60 hover:text-white'}`}
                    >
                        Technology
                    </button>
                    <button
                        onClick={() => setActiveTab('governance')}
                        className={`text-sm uppercase tracking-widest transition-colors ${activeTab === 'governance' ? 'text-white font-medium' : 'text-white/60 hover:text-white'}`}
                    >
                        Governance
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`text-sm uppercase tracking-widest transition-colors ${activeTab === 'about' ? 'text-white font-medium' : 'text-white/60 hover:text-white'}`}
                    >
                        About
                    </button>
                </div>

                <div className="flex items-center gap-4 z-50 relative">
                    {isAuthenticated ? (
                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`text-sm uppercase tracking-widest transition-colors mr-4 ${activeTab === 'dashboard' ? 'text-white font-medium' : 'text-white/60 hover:text-white'}`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors group"
                            >
                                <User size={14} className="text-emerald-400 group-hover:text-emerald-300" />
                                <span className="text-xs text-white/70 group-hover:text-white">
                                    {user?.email || user?.walletAddress?.slice(0, 6) + '...' + user?.walletAddress?.slice(-4)}
                                </span>
                                <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded">
                                    {user?.role}
                                </span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-white/60 hover:text-white transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => { setAuthType('login'); setShowAuth(true); }}
                            className="hidden md:block px-6 py-2 text-xs uppercase tracking-widest border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300"
                        >
                            Sign In
                        </button>
                    )}
                    <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-[#050505] z-40 pt-28 px-6 md:hidden animate-fade-in flex flex-col h-screen">
                    <div className="flex flex-col gap-6 text-xl font-serif">
                        {['Marketplace', 'Technology', 'Governance', 'About'].map((item) => (
                            <button
                                key={item}
                                onClick={() => {
                                    setActiveTab(item.toLowerCase());
                                    setIsMenuOpen(false);
                                }}
                                className={`text-left py-4 border-b border-white/10 transition-colors ${activeTab === item.toLowerCase() ? 'text-white' : 'text-white/50'}`}
                            >
                                {item}
                            </button>
                        ))}

                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => {
                                        setActiveTab('dashboard');
                                        setIsMenuOpen(false);
                                    }}
                                    className={`text-left py-4 border-b border-white/10 transition-colors ${activeTab === 'dashboard' ? 'text-white' : 'text-white/50'}`}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('profile');
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full mt-4 p-4 bg-white/5 border border-white/10 rounded-lg text-left hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <User size={16} className="text-emerald-400" />
                                        <span className="text-sm text-white/70">
                                            {user?.email || user?.walletAddress?.slice(0, 10) + '...'}
                                        </span>
                                    </div>
                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                                        {user?.role}
                                    </span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-sans font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => { setAuthType('login'); setShowAuth(true); setIsMenuOpen(false); }}
                                className="mt-8 w-full py-4 bg-white text-black rounded-lg font-sans font-medium hover:bg-emerald-400 transition-colors"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
