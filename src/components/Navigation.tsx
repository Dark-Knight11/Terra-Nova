import React from 'react';
import { Leaf, Menu, X } from 'lucide-react';

interface NavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
    scrolled: boolean;
    setAuthType: (type: string) => void;
    setShowAuth: (show: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, isMenuOpen, setIsMenuOpen, scrolled, setAuthType, setShowAuth }) => (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-lg border-b border-white/5 py-4' : 'py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
            <button onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }} className="text-2xl font-serif text-white tracking-wider flex items-center gap-2 hover:opacity-80 transition-opacity z-50 relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center">
                    <Leaf size={16} className="text-white" />
                </div>
                DCCP
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
                <button
                    onClick={() => { setAuthType('login'); setShowAuth(true); }}
                    className="hidden md:block px-6 py-2 text-xs uppercase tracking-widest border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                    Connect Wallet
                </button>
                <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
            <div className="fixed inset-0 bg-[#050505] z-40 pt-28 px-6 md:hidden animate-fade-in flex flex-col h-screen">
                <div className="flex flex-col gap-6 text-xl font-serif">
                    {['Marketplace', 'Technology', 'Governance'].map((item) => (
                        <button
                            key={item}
                            onClick={() => {
                                setActiveTab(item.toLowerCase()); setIsMenuOpen(false);
                            }}
                            className={`text-left py-4 border-b border-white/10 transition-colors ${activeTab === item.toLowerCase() ? 'text-white' : 'text-white/50'}`}
                        >
                            {item}
                        </button>
                    ))}
                    <button
                        onClick={() => { setAuthType('login'); setShowAuth(true); setIsMenuOpen(false); }}
                        className="mt-8 w-full py-4 bg-white text-black rounded-lg font-sans font-medium hover:bg-emerald-400 transition-colors"
                    >
                        Connect Wallet
                    </button>
                </div>
            </div>
        )}
    </nav>
);

export default Navigation;
