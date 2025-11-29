import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, ChevronRight, Sparkles, Shield } from 'lucide-react';

interface MarketplaceChatProps {
    credits: any[];
    onPurchaseIntent: (listing: any, quantity: number) => void;
}

interface Message {
    id: number;
    role: 'user' | 'agent';
    content: string;
    listings?: any[];
    action?: 'quantity_request';
    selectedListing?: any;
}

export const MarketplaceChat: React.FC<MarketplaceChatProps> = ({ credits, onPurchaseIntent }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, role: 'agent', content: "Hello! I'm your AI Market Assistant. I can help you find specific carbon credits or execute trades. Try asking for 'reforestation projects' or 'blue carbon'." }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue.trim();
        setInputValue('');

        // Add user message
        const newUserMsg: Message = { id: Date.now(), role: 'user', content: userText };
        setMessages(prev => [...prev, newUserMsg]);
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            let responseMsg: Message = { id: Date.now() + 1, role: 'agent', content: '' };

            // Check context from previous message
            const lastAgentMsg = messages[messages.length - 1]?.role === 'agent' ? messages[messages.length - 1] : null;

            // 1. Handle Quantity Input for Purchase
            if (lastAgentMsg?.action === 'quantity_request' && lastAgentMsg.selectedListing) {
                const qty = parseInt(userText.replace(/[^0-9]/g, ''));
                if (qty > 0) {
                    responseMsg.content = `Understood. Initiating purchase analysis for ${qty} credits of ${lastAgentMsg.selectedListing.title}...`;
                    setMessages(prev => [...prev, responseMsg]);
                    setIsTyping(false);

                    // Trigger purchase intent after a short delay
                    setTimeout(() => {
                        onPurchaseIntent(lastAgentMsg.selectedListing, qty);
                    }, 1500);
                    return;
                } else {
                    responseMsg.content = "I didn't catch a valid quantity. Please enter a number (e.g., '100').";
                    responseMsg.action = 'quantity_request';
                    responseMsg.selectedListing = lastAgentMsg.selectedListing;
                }
            }
            // 2. Handle Search / Discovery
            else {
                const lowerText = userText.toLowerCase();
                const keywords = lowerText.split(' ');

                // Filter credits
                const matches = credits.filter(c => {
                    const title = c.title?.toLowerCase() || '';
                    const type = c.type?.toLowerCase() || '';
                    const location = c.location?.toLowerCase() || '';
                    const company = (typeof c.company === 'string' ? c.company : c.company?.name || '').toLowerCase();

                    return keywords.some(k =>
                        (k.length > 3 && (title.includes(k) || type.includes(k) || location.includes(k) || company.includes(k))) ||
                        (lowerText.includes('blue') && type.includes('ocean')) ||
                        (lowerText.includes('forest') && type.includes('forest'))
                    );
                });

                if (matches.length > 0) {
                    responseMsg.content = `I found ${matches.length} project${matches.length > 1 ? 's' : ''} matching your criteria:`;
                    responseMsg.listings = matches.slice(0, 3); // Limit to 3
                } else {
                    responseMsg.content = "I couldn't find any specific projects matching that description. You can try searching for 'solar', 'forest', or 'India'.";
                }
            }

            setMessages(prev => [...prev, responseMsg]);
            setIsTyping(false);
        }, 1000);
    };

    const handleSelectListing = (listing: any) => {
        const msg: Message = {
            id: Date.now(),
            role: 'agent',
            content: `Excellent choice. How many credits of "${listing.title}" would you like to purchase?`,
            action: 'quantity_request',
            selectedListing: listing
        };
        setMessages(prev => [...prev, msg]);
    };

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center text-black hover:scale-110 transition-transform z-40 group"
                >
                    <MessageCircle size={28} />
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
                    <div className="absolute right-full mr-4 bg-white text-black px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Ask AI Agent
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-8 right-8 w-[400px] h-[600px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <Bot size={18} className="text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-medium text-white">Market Assistant</h3>
                                <div className="flex items-center gap-1 text-xs text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Online
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white'} rounded-2xl px-4 py-3 text-sm`}>
                                    <p>{msg.content}</p>

                                    {/* Listings Cards */}
                                    {msg.listings && (
                                        <div className="mt-3 space-y-2">
                                            {msg.listings.map(listing => (
                                                <div key={listing.id} className="bg-black/40 rounded-lg p-3 border border-white/5 hover:border-emerald-500/30 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded bg-cover bg-center flex-shrink-0" style={{ background: listing.image }}></div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{listing.title}</div>
                                                            <div className="text-xs opacity-60 truncate">{listing.location} • {listing.type}</div>
                                                            <div className="flex justify-between items-center mt-1">
                                                                <div className="text-emerald-400 font-mono text-xs">${listing.price}</div>
                                                                <div className="flex items-center gap-1 text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                                    <Shield size={10} />
                                                                    <span>{listing.score}/100</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSelectListing(listing)}
                                                        className="w-full mt-2 py-1.5 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        Select Project <ChevronRight size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 rounded-2xl px-4 py-3 flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 bg-white/5">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className="w-full bg-black/50 border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-black rounded-full hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
