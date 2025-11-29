import React, { useState, useEffect } from 'react';
import { CheckCircle, Terminal, Globe, Newspaper, TrendingUp, ShieldCheck, Calculator, DollarSign, X } from 'lucide-react';

interface AgenticAnalysisOverlayProps {
    onComplete: () => void;
    onClose: () => void;
    initialPrice: string | number;
    maxQuantity?: number;
}

const steps = [
    { id: 1, text: "Initializing Agent Swarm...", icon: Terminal, duration: 1500 },
    { id: 2, text: "Scanning Global Carbon Registries...", icon: Globe, duration: 2000 },
    { id: 3, text: "Fetching Real-time News & Regulatory Updates...", icon: Newspaper, duration: 2500 },
    { id: 4, text: "Analyzing Market Sentiment...", icon: TrendingUp, duration: 2000 },
    { id: 5, text: "Verifying Developer Credibility...", icon: ShieldCheck, duration: 1800 },
    { id: 6, text: "Calculating Fair Market Value...", icon: Calculator, duration: 2000 },
    { id: 7, text: "Finalizing Target Price...", icon: DollarSign, duration: 1500 },
];

const AgenticAnalysisOverlay: React.FC<AgenticAnalysisOverlayProps> = ({ onComplete, onClose, initialPrice, maxQuantity }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [targetPrice, setTargetPrice] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const processStep = (index: number) => {
            if (index >= steps.length) {
                // Calculate target price (randomly 95-99% of initial)
                const priceNum = parseFloat(initialPrice.toString().replace(/[^0-9.]/g, '')) || 0;
                const discountFactor = 0.95 + (Math.random() * 0.04);
                const calculated = (priceNum * discountFactor).toFixed(2);
                setTargetPrice(calculated);

                setTimeout(() => setShowResult(true), 1000);
                return;
            }

            setCurrentStep(index);
            setLogs(prev => [...prev, `> ${steps[index].text}`]);

            timeoutId = setTimeout(() => {
                processStep(index + 1);
            }, steps[index].duration);
        };

        processStep(0);

        return () => clearTimeout(timeoutId);
    }, [initialPrice]);

    // Auto-scroll logs
    useEffect(() => {
        const logContainer = document.getElementById('agent-logs');
        if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }, [logs]);

    const CurrentIcon = steps[currentStep]?.icon || CheckCircle;

    if (showResult) {
        const pricePerUnit = parseFloat(targetPrice);
        const totalValue = (pricePerUnit * quantity).toFixed(2);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
                <div className="relative w-full max-w-md bg-[#0a0a0a] border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                        <CheckCircle size={40} className="text-emerald-400" />
                    </div>

                    <h2 className="text-2xl font-serif text-white mb-2">Analysis Complete</h2>
                    <p className="text-white/50 text-sm mb-6">
                        Our agents have identified an optimal entry point based on current market conditions.
                    </p>

                    <div className="w-full bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white/40 text-sm">Original Price</span>
                            <span className="text-white/40 line-through">${initialPrice}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-emerald-400 font-medium">Target Price</span>
                            <span className="text-3xl font-mono text-white">${targetPrice}</span>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex flex-col items-start">
                                    <span className="text-white/60 text-sm">Quantity (tCO2e)</span>
                                    {maxQuantity && (
                                        <span className="text-xs text-white/30">Max: {maxQuantity.toLocaleString()}</span>
                                    )}
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max={maxQuantity}
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        if (maxQuantity && val > maxQuantity) {
                                            setQuantity(maxQuantity);
                                        } else {
                                            setQuantity(Math.max(1, val));
                                        }
                                    }}
                                    className="w-24 bg-black/50 border border-white/20 rounded px-2 py-1 text-right text-white font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-emerald-400 font-medium">Total Execution Value</span>
                                <span className="text-xl font-mono text-white">${totalValue}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                            <span className="text-white/40">Confidence Score</span>
                            <span className="text-emerald-400">98.5%</span>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onComplete}
                            className="flex-1 py-3 px-4 rounded-lg bg-emerald-500 text-black font-medium hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                        >
                            Execute Trade
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-emerald-900/10">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        <span className="ml-4 font-mono text-emerald-400 text-sm tracking-wider">AI_AGENT_ANALYSIS_V2.0</span>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Main Content */}
                <div className="p-8 flex flex-col items-center justify-center flex-1 min-h-[300px]">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse-slow"></div>
                        <div className="relative w-24 h-24 bg-black border-2 border-emerald-500/50 rounded-full flex items-center justify-center">
                            {currentStep < steps.length ? (
                                <CurrentIcon size={40} className="text-emerald-400 animate-pulse" />
                            ) : (
                                <CheckCircle size={40} className="text-emerald-400" />
                            )}
                        </div>
                    </div>

                    <h2 className="text-2xl font-serif text-white mb-2 text-center">
                        {currentStep < steps.length ? steps[currentStep].text : "Analysis Complete"}
                    </h2>
                    <p className="text-white/50 text-sm mb-8 text-center max-w-md">
                        Our autonomous agents are verifying on-chain data and calculating the optimal entry price.
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md h-1 bg-white/10 rounded-full overflow-hidden mb-8">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(((currentStep + 1) / steps.length) * 100, 100)}%` }}
                        />
                    </div>

                    {/* Terminal Logs */}
                    <div
                        id="agent-logs"
                        className="w-full bg-black/50 rounded-lg border border-white/10 p-4 font-mono text-xs text-emerald-500/80 h-32 overflow-y-auto"
                    >
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 opacity-80">
                                {log}
                                {i === logs.length - 1 && currentStep < steps.length && (
                                    <span className="animate-pulse">_</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgenticAnalysisOverlay;
