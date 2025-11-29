import React, { useState, useEffect } from 'react';
import { CheckCircle, Terminal, Globe, Newspaper, TrendingUp, ShieldCheck, Calculator, DollarSign, X } from 'lucide-react';

interface AgenticAnalysisOverlayProps {
    onComplete: () => void;
    onClose: () => void;
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

const AgenticAnalysisOverlay: React.FC<AgenticAnalysisOverlayProps> = ({ onComplete, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const processStep = (index: number) => {
            if (index >= steps.length) {
                setTimeout(onComplete, 1000); // Wait a bit after final step before completing
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
    }, [onComplete]);

    // Auto-scroll logs
    useEffect(() => {
        const logContainer = document.getElementById('agent-logs');
        if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }, [logs]);

    const CurrentIcon = steps[currentStep]?.icon || CheckCircle;

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
